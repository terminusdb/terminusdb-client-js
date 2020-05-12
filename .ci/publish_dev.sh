#!/bin/bash
npm ci
echo "\
always-auth=true
registry=https://packagecloud.io/rrooij/development/npm/
//packagecloud.io/rrooij/development/npm/:_authToken=$PACKAGECLOUD_TOKEN
" > $TRAVIS_BUILD_DIR/.npmrc
npm publish
