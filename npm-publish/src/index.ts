import { join } from 'node:path';
import { debug, setOutput } from '@actions/core';
import { getOctokit } from '@actions/github';
import { exec } from '@actions/exec';

import { filter } from '../../utils/async-filter';
import { log_tap } from '../../utils/log-tap';
import {
  get_inputs,
  get_workspace_paths,
  is_beta,
  is_default_branch,
  read_node_package,
} from './utils';

async function main() {
  const {
    github_token,
    package_dir_path,
    included_workspaces,
    excluded_workspaces,
  } = get_inputs();
  const octokit = getOctokit(github_token);

  process.chdir(package_dir_path);

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
    .then(log_tap(debug, 'all package.json files'))
    // filter out packages that aren't published to registry
    .then((packages) => filter(packages, (pkg) => pkg.private !== true))
    .then(log_tap(debug, 'publishable packages'))
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
    .then(log_tap(debug, 'unpublished versions'))
    // are we on the default branch, or is it a prerelease version?
    .then((packages) =>
      filter(
        packages,
        async (pkg) => (await is_default_branch(octokit)) || is_beta(pkg),
      ),
    )
    .then(log_tap(debug, 'default branch / prerelease versions'));

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
