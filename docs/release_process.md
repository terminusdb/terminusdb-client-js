# Releasing a new version of the client

1. Review the changelog between last tagged release v10.0.34..HEAD
1. Create a branch and update RELEASE_NOTES.md based on changes
1. Add target version number to release notes
1. Check in and merge
1. Pick the latest version from the RELEASE_NOTES.md file
1. Tag the repo locally and push the tag, align the release (git tag -s v11.x.x)
1. The new release will be built and published 🎉
