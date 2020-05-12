#!/bin/bash
npm ci
echo "//packagecloud.io/rrooij/development/npm/:_authToken=$PACKAGECLOUD_TOKEN" > $HOME/.npmrc
npm set registry https://packagecloud.io/rrooij/development/npm/
npm publish
