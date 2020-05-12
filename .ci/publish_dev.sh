#!/bin/bash
npm ci
echo "\
always-auth=true
registry=https://packagecloud.io/rrooij/development/npm/
//packagecloud.io/rrooij/development/npm/:_authToken=$PACKAGECLOUD_API_TOKEN
" > $TRAVIS_BUILD_DIR/.npmrc
npm unpublish "@terminusdb/terminusdb-client@$VERSION" || true
npm publish
