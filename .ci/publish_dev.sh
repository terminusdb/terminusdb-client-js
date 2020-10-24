#!/bin/bash
curl -urrooij:$BINTRAY_API_TOKEN https://api.bintray.com/npm/terminusdb/npm-dev/auth > $TRAVIS_BUILD_DIR/.npmrc
curl -XDELETE https://api.bintray.com/packages/terminusdb/npm-dev/terminusdb-client -u "rrooij:$BINTRAY_API_TOKEN"
npm publish --access=public
curl -T "dist/terminusdb-client.min.js" -u"rrooij:$BINTRAY_CURL_API_KEY" "https://api.bintray.com/content/terminusdb/terminusdb/terminusdb-client/dev/dev/terminusdb-client.min.js?publish=1&override=1"
curl -T "dist/terminusdb-client.min.js.map" -u"rrooij:$BINTRAY_CURL_API_KEY" "https://api.bintray.com/content/terminusdb/terminusdb/terminusdb-client/dev/dev/terminusdb-client.min.js.map?publish=1&override=1"
