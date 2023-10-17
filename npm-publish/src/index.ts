import { dirname, join, resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { getInput, info, setOutput } from '@actions/core';
import { getOctokit, context } from '@actions/github';
import type { GitHub } from '@actions/github/lib/utils';
import { exec } from '@actions/exec';
import type { PackageJson } from 'type-fest';

import { ParseStringToArray } from '../../utils/parse-string-to-array';
import { CheckNodePackage } from '../../utils/check-node-package';
import { filter } from '../../utils/async-filter';
import { log_tap } from '../../utils/log-tap';
import { GITHUB_TOKEN } from './config';

async function get_workspace_paths(
  package_dir_path: string,
  included_workspaces: undefined | string[],
  excluded_workspaces: undefined | string[],
): Promise<string[]> {
  function filterExcluded(ws: string): boolean {
    return !(excluded_workspaces ?? []).includes(ws);
  }

  if (Array.isArray(included_workspaces) && included_workspaces.length > 0) {
    // filter out excluded
    return included_workspaces.filter(filterExcluded);
  } else {
    // read in workspaces from primary package.json
    const package_json: PackageJson = await read_node_package(
      join(package_dir_path, 'package.json'),
    );
    if (Array.isArray(package_json.workspaces)) {
      return package_json.workspaces.filter(filterExcluded);
    } else {
      return [package_dir_path];
    }
  }
}

type PackageJsonWithPaths = PackageJson & {
  workspace_path: string;
  parent_package: string;
};
function read_node_package(
  path: string,
  workspace: string | undefined = undefined,
): Promise<PackageJson | PackageJsonWithPaths> {
  return readFile(path)
    .then((buffer) => buffer.toString())
    .then((string) => JSON.parse(string) as unknown)
    .then((object) => CheckNodePackage(object))
    .then((pkg) => ({
      ...pkg,
      ...(workspace != null
        ? { workspace_path: dirname(path), parent_package: workspace }
        : {}),
    }));
}

function get_inputs(): {
  package_dir_path: string;
  included_workspaces: string[];
  excluded_workspaces: string[];
} {
  const package_dir_path = resolve(getInput('package-dir-path'));
  const included_workspaces = ParseStringToArray(
    getInput('included-workspaces'),
  ).map((p) => resolve(p));
  const excluded_workspaces = ParseStringToArray(
    getInput('excluded-workspaces'),
  ).map((p) => resolve(p));

  if (package_dir_path.endsWith('package.json')) {
    throw new TypeError(
      `\`package_dir_path\` should be a path to a directory (ie, should not end with "package.json")`,
    );
  }
  for (const workspace of [...included_workspaces, ...excluded_workspaces]) {
    if (workspace.endsWith('package.json')) {
      throw new TypeError(
        `workspaces should be a path to a directory (ie, should not end with "package.json")`,
      );
    }
  }

  return {
    package_dir_path,
    included_workspaces,
    excluded_workspaces,
  };
}

function is_beta(pkg: PackageJson): boolean {
  return pkg.version.match(/^[\d.]+-.+$/u) != null;
}

async function is_default_branch(
  octokit: InstanceType<typeof GitHub>,
): Promise<boolean> {
  const {
    data: { default_branch },
  } = await octokit.rest.repos.get({ ...context.repo });

  return context.ref === default_branch;
}

async function main() {
  info(`cwd: ${process.cwd()}`);

  const { package_dir_path, included_workspaces, excluded_workspaces } =
    get_inputs();
  const octokit = getOctokit(GITHUB_TOKEN);

  process.chdir(package_dir_path);
  info(`cwd: ${process.cwd()}`);

  const packages = await get_workspace_paths(
    package_dir_path,
    included_workspaces,
    excluded_workspaces,
  )
    // read in package.json files
    .then((workspaces) =>
      Promise.all(
        workspaces.map((workspace) =>
          read_node_package(
            join(workspace, 'package.json'),
            workspace !== package_dir_path ? package_dir_path : undefined,
          ),
        ),
      ),
    )
    .then(log_tap(info, 'all package.json files'))
    // filter out packages that aren't published to registry
    .then((packages) => filter(packages, (pkg) => pkg.private !== true))
    .then(log_tap(info, 'publishable packages'))
    // filter out packages whose version is already published
    .then((packages) =>
      filter(
        packages,
        (pkg) =>
          new Promise((resolve) => {
            exec(`npm view ${pkg.name}@${pkg.version} version`, [], {
              silent: true,
            })
              .then(() => resolve(false))
              .catch(() => resolve(true));
          }),
      ),
    )
    .then(log_tap(info, 'unpublished versions'))
    // are we on the default branch, or is it a prerelease version?
    .then((packages) =>
      filter(
        packages,
        async (pkg) => (await is_default_branch(octokit)) || is_beta(pkg),
      ),
    )
    .then(log_tap(info, 'default branch / prerelease versions'));

  // publish packages
  await Promise.all(
    packages.map(async (pkg) => {
      if (
        typeof pkg.workspace_path === 'string' &&
        typeof pkg.parent_package === 'string'
      ) {
        process.chdir(pkg.parent_package);
        await exec(`npm publish --workspace ${pkg.workspace_path}`);
      } else {
        await exec(`npm publish`);
      }

      return pkg;
    }),
  ).then((packages) => {
    setOutput(
      'published-package-names',
      packages.map((pkg) => pkg.name).join('\n'),
    );

    return packages;
  });
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
