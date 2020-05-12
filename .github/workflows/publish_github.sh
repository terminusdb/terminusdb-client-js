#!/bin/bash
npm config set registry https://npm.pkg.github.com/
VERSION=$(cat package.json | jq '.version' | sed 's/"//g')
npm unpublish @terminusdb/terminusdb-client@$VERSION
npm publish
