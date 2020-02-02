#!/bin/bash
cd ../

PUBLICATION_BRANCH=gh-pages
# Checkout the branch
REPO_PATH=$PWD
pushd $HOME
git clone --branch=$PUBLICATION_BRANCH    https://${GITHUB_TOKEN}@github.com/$TRAVIS_REPO_SLUG gh-pages-dir 2>&1 > /dev/null
cd gh-pages-dir
# Update pages
cp -r $REPO_PATH/public_pages .
# Commit and push latest version
git add .
git config user.name  "Travis"
git config user.email "travis@travis-ci.org"
git commit -m "Updated version."
git push -fq origin $PUBLICATION_BRANCH 2>&1 > /dev/null
popd

cd ../terminus-client