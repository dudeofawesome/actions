# `dudeofawesome/actions/build-artifact/cache`

Caches a tarred file or directory into a short-lived artifact for use with later jobs.

## Usage

```yaml
jobs:
    build:
        runs-on: 'ubuntu-latest'
        steps:
            - uses: 'actions/checkout@v3'
            - run: 'touch "sample.txt"'
            - uses: 'dudeofawesome/actions/build-artifact/cache@v1'
```

## Inputs

-   `path`: Path of file or files to archive
-   `archive-name`: The name of the archive.

## Outputs

-   `archive-name`: The name of the archive.
