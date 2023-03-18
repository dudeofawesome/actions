# `dudeofawesome/actions/build-artifact/retrieve`

Retrieves a tarred file or directory into a short-lived artifact for use with later jobs.

## Usage

```yaml
jobs:
    build:
        runs-on: 'ubuntu-latest'
        steps:
            - uses: 'dudeofawesome/actions/build-artifact/retrieve@v1'
```

## Inputs

-   `path`: Path of file or files to archive
-   `archive-name`: The name of the archive.
