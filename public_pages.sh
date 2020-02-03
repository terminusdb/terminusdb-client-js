#!/bin/bash
echo "___SONO IN SCRIPT____"


PUBLICATION_BRANCH=gh-pages
# Checkout the branch
REPO_PATH=$PWD

echo "$REPO_PATH"

pushd "$HOME" || exit
git clone --branch=$PUBLICATION_BRANCH  "https://${GITHUB_TOKEN}@github.com/$TRAVIS_REPO_SLUG" tmp_pages 2>&1 > /dev/null
cd tmp_pages || exit

#rm -rf 1.1.14
#rm -rf 1.1.13
# Update pages
cp -r $REPO_PATH/public_pages/.  .
# Commit and push latest version
git add .
git config user.name  "Travis"
git config user.email "travis@travis-ci.org"
git commit -m "Updated version."
git push -fq origin $PUBLICATION_BRANCH 2>&1 > /dev/null
popd || exit
