# Releasing a new version of the client

1. Review the changelog between last tagged release v12.0.x..HEAD
2. Pick the next version number, update package.json, and run `npm install`
3. Create a branch and update RELEASE_NOTES.md based on changes
4. Add target version number to release notes
5. Check in and merge
6. On GitHub, draft a new release with a new `v<version>` tag on `main` and paste the release notes
7. Publish the release — the `production.yml` workflow verifies the tag against package.json, builds, and publishes to npm via trusted publishing

Setup and troubleshooting for the npm integration lives in `docs/npm_publish_setup.md`.
