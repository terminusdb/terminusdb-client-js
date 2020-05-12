#!/bin/bash
npm set registry https://packagecloud.io/rrooij/development/npm/
echo "//packagecloud.io/rrooij/development/npm/:_authToken=$PACKAGECLOUD_TOKEN" > $HOME/.npmrc
npm publish
