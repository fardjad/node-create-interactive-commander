#!/usr/bin/env bash

set -ex

cd "$(dirname "$0")/.."

check_command() {
  command -v "$1" > /dev/null 2>&1
}

if ! check_command node; then
  echo "Node.js is not installed. Please install it and try again." >&2
  exit 1
fi

if ! check_command npm; then
  echo "npm is not installed. Please install it and try again." >&2
  exit 1
fi

npm ci
rm -rf template-test
node ./bin/run.js generate -I --directory-name template-test --package-name template-test --command-name template-test

npx ncu --packageFile ./template-test/package.json --upgrade

cd template-test
npm install
npm run format
npm run test
node ./bin/run.js hello --name world

npm pkg get dependencies > ../templates/dependencies.json
npm pkg get devDependencies > ../templates/dev-dependencies.json
