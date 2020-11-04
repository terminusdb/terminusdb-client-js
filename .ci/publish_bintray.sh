#!/bin/bash
BRANCH=$1
curl -u "rrooij:$BINTRAY_API_TOKEN" "https://api.bintray.com/npm/terminusdb/npm-$BRANCH/auth" > .npmrc
curl -XDELETE "https://api.bintray.com/packages/terminusdb/npm-$BRANCH/terminusdb:terminusdb-client" -u "rrooij:$BINTRAY_API_TOKEN"
npm publish
curl -T "dist/terminusdb-client.min.js" -u"rrooij:$BINTRAY_API_TOKEN" "https://api.bintray.com/content/terminusdb/terminusdb/terminusdb-client/$BRANCH/$BRANCH/terminusdb-client.min.js?publish=1&override=1"
curl -T "dist/terminusdb-client.min.js.map" -u"rrooij:$BINTRAY_API_TOKEN" "https://api.bintray.com/content/terminusdb/terminusdb/terminusdb-client/$BRANCH/$BRANCH/terminusdb-client.min.js.map?publish=1&override=1"
