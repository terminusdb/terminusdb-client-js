#!/bin/bash
echo "\
registry=https://api.bintray.com/npm/terminusdb/npm-dev
_auth=$BINTRAY_TOKEN
always-auth=true
email=robin@datachemist.com" > $TRAVIS_BUILD_DIR/.npmrc
VERSION=$(cat package.json | jq '.version' | sed 's/"//g')
npm unpublish "@terminusdb/terminusdb-client@$VERSION" || true
npm publish
