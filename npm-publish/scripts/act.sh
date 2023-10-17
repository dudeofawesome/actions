#!/usr/bin/env bash

echo docker
docker run \
  --detach \
  --rm \
  --name verdaccio \
  --publish '4873:4873' \
  'docker.io/verdaccio/verdaccio:5'

echo build
npm run build -w npm-publish/

echo act
act --secret GITHUB_TOKEN="$GITHUB_TOKEN" --workflows .github/workflows/npm-publish.yaml --job test

docker stop verdaccio
