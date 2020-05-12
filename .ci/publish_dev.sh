#!/bin/bash
npm ci
echo "\
always-auth=true
registry=https://packagecloud.io/rrooij/development/npm/
//packagecloud.io/rrooij/development/npm/:_authToken=$PACKAGECLOUD_TOKEN
" > $HOME/.npmrc
npm set registry https://packagecloud.io/rrooij/development/npm/
npm publish
