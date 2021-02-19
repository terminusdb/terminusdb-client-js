BRANCH=$1
gsutil cp -r dist/* "gs://cdn.terminusdb.com/js_libs/terminusdb-client/${BRANCH}/"
