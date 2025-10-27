# Releasing a new version of the client

1. Review the changelog between last tagged release v11.1.x..HEAD
2. Pick the next version number, update package.json, and run `npm install`
3. Create a branch and update RELEASE_NOTES.md based on changes
4. Add target version number to release notes
5. Check in and merge
6. Pick the latest version from the RELEASE_NOTES.md file
7. Update package.json version and run npm install
8. Tag the repo locally and push the tag, align the release (git tag -s v11.x.x)
9.  The new release will be built and published 🎉
