#!/usr/bin/env bash
set -e

echo build
npm run build -w npm-publish/

echo act
act --secret GITHUB_TOKEN="$GITHUB_TOKEN" --workflows .github/workflows/npm-publish.yaml --job test
