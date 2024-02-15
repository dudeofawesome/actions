# `dudeofawesome/actions/npm-publish` [![release](https://github.com/dudeofawesome/actions/actions/workflows/test-npm-publish.yaml/badge.svg)](https://github.com/dudeofawesome/actions/actions/workflows/test-npm-publish.yaml)

A Github Actions node action to publish node packages to a registry.

## Usage

```yaml
jobs:
    build:
        runs-on: 'ubuntu-latest'
        steps:
            - uses: 'actions/checkout@v4'
            - uses: 'actions/setup-node@v4'
            - uses: 'dudeofawesome/actions/npm-publish@v1'
```

## Inputs

-   `package-dir-path`: Path of dir with (main) package.json.
-   `included-workspaces`: A list of newline-separated workspace paths to include.
-   `excluded-workspaces` A list of newline-separated workspace paths to exclude.

## Outputs

-   `published-package-names`: A newline-delimited list of published package names.
