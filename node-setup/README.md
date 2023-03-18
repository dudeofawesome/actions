# `dudeofawesome/actions/node-setup`

Setup node, repo, and dependencies, with caching.

## Usage

```yaml
jobs:
    build:
        runs-on: 'ubuntu-latest'
        steps:
            - uses: 'dudeofawesome/actions/node-setup@v1'
```

## Inputs

-   `node-version-file`: Path to a file containing the version Spec of the version to use.
-   `registry-url`: Registry to set up auth with, using $NODE_AUTH_TOKEN. Will be set up in a project-level npmrc.
