#!/bin/bash
VERSION=$(cat package.json | jq '.version' | sed 's/"//g')
npm unpublish @terminusdb/terminusdb-client@$VERSION
npm publish
