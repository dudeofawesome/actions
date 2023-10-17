import { dirname, join, resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { getInput } from '@actions/core';
import { context } from '@actions/github';
import type { GitHub } from '@actions/github/lib/utils';
import type { PackageJson } from 'type-fest';

import { ParseStringToArray } from 'utils/parse-string-to-array';
import { CheckNodePackage } from 'utils/check-node-package';

export async function get_workspace_paths(
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
export function read_node_package(
  path: string,
  workspace: string | undefined = undefined,
): Promise<PackageJson | PackageJsonWithPaths> {
  return readFile(path)
    .then((buffer) => buffer.toString())
    .then((string) => JSON.parse(string) as unknown)
    .then((object) => CheckNodePackage(object))
    .then(
      (pkg) =>
        ({
          ...pkg,
          ...(workspace != null
            ? { workspace_path: dirname(path), parent_package: workspace }
            : {}),
        }) as PackageJson,
    );
}

export function get_inputs(): {
  github_token: string;
  package_dir_path: string;
  included_workspaces: string[];
  excluded_workspaces: string[];
} {
  const github_token = getInput('github-token');
  const package_dir_path = resolve(getInput('package-dir-path'));
  const included_workspaces = ParseStringToArray(
    getInput('included-workspaces'),
  ).map((p) => resolve(p));
  const excluded_workspaces = ParseStringToArray(
    getInput('excluded-workspaces'),
  ).map((p) => resolve(p));

  if (github_token.length === 0) {
    throw new TypeError(`github-token must be set.`);
  }

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
    github_token,
    package_dir_path,
    included_workspaces,
    excluded_workspaces,
  };
}

export function is_beta(pkg: PackageJson): boolean {
  return pkg.version?.match(/^[\d.]+-.+$/u) != null;
}

export async function is_default_branch(
  octokit: InstanceType<typeof GitHub>,
): Promise<boolean> {
  const {
    data: { default_branch },
  } = await octokit.rest.repos.get({ ...context.repo });

  return context.ref === default_branch;
}
