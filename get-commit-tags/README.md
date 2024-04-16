# `dudeofawesome/actions/get-commit-tags` [![release](https://github.com/dudeofawesome/actions/actions/workflows/test-get-commit-tags.yaml/badge.svg)](https://github.com/dudeofawesome/actions/actions/workflows/test-get-commit-tags.yaml)

Gets all tags referencing the specified commit.

## Usage

```yaml
jobs:
    build:
        runs-on: 'ubuntu-latest'
        steps:
            - uses: 'dudeofawesome/actions/get-commit-tags@v1'
```

## Inputs

| Name         | Description                                                                    |
| ------------ | ------------------------------------------------------------------------------ |
| `commit-sha` | The SHA of the commit you want to check for tags on. Defaults to `github.sha`. |

## Outputs

| Name              | Description                                                                    |
| ----------------- | ------------------------------------------------------------------------------ |
| `commit-sha`      | The SHA of the commit you want to check for tags on. Defaults to `github.sha`. |
| `tags`            | A list of newline-delimited tags pointing to the specified commit.             |
| `is_tagged`       | Whether or not the specified commit has any tags pointing to it.               |
| `has_version_tag` | Whether or not the specified commit has a version tag pointing to it.          |
