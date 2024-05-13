#!/usr/bin/env bash

cd "$(dirname "$0")/.."
rm -rf template-test
node ./bin/run.js generate -I --directory-name template-test --package-name template-test --command-name template-test
cd template-test
npm install
npm test
