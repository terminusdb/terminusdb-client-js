#!/bin/bash
npm ci
echo "\
registry=https://api.bintray.com/npm/terminusdb/npm-dev
_auth=rrooij:$BINTRAY_TOKEN
email=robin@datachemist.com
always-auth=true" > $TRAVIS_BUILD_DIR/.npmrc
VERSION=$(cat package.json | jq '.version' | sed 's/"//g')
npm unpublish "@terminusdb/terminusdb-client@$VERSION"
npm publish
