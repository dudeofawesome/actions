# `dudeofawesome/actions/npm-install` [![release](https://github.com/dudeofawesome/actions/actions/workflows/test-npm-install.yaml/badge.svg)](https://github.com/dudeofawesome/actions/actions/workflows/test-npm-install.yaml)

A Github Actions composite action to install and cache node modules.

## Usage

```yaml
jobs:
    build:
        runs-on: 'ubuntu-latest'
        steps:
            - uses: 'actions/checkout@v3'
            - uses: 'actions/setup-node@v3'
            - uses: 'dudeofawesome/actions/npm-install@v1'
```

## Inputs

-   `package-path`: Path of dir with package.json.
-   `modules-dir`: Path of node_modules dir.
-   `cache-key` The cache key.

## Outputs

-   `modules-dir`: Path of node_modules dir.
-   `cache-key` The cache key.
