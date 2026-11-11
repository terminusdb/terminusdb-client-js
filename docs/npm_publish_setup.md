# Publishing to npm with trusted publishing

This package publishes to npm automatically when a GitHub Release is published. Authentication uses npm trusted publishing (OIDC) — no API token is stored anywhere, so there is nothing to leak or rotate. GitHub proves its identity to npm directly, and npm issues a short-lived credential for that one publish run.

This guide covers the one-time setup on npmjs.com and the release procedure. The publish workflow lives under `.github/workflows/`; substitute your own values wherever a placeholder appears below.

## Prerequisites

- Maintainer or owner access to the package on npmjs.com.
- Two-factor authentication enabled on your npm account (npm requires it for trusted publishing).
- Admin access to the GitHub repository.

## Releasing a version

1. Update `version` in `package.json` and run `npm install` to refresh the lockfile.
2. Add the version's notes to `RELEASE_NOTES.md` and merge everything to the default branch.
3. On GitHub: **Releases → Draft a new release**.
4. Create a new tag in the form `v<version>` (for example `v1.2.3`) targeting the default branch, and paste the release notes.
5. Publish the release. The workflow fires, checks that the tag matches `package.json`'s version, builds, and publishes to npm with a provenance attestation.

If the tag does not match `package.json`, the job fails before publishing — a mistyped tag can never ship the wrong version.

## Verifying a publish

- The run appears under the repository's **Actions** tab. A green run means npm accepted the package.
- The package page on npmjs.com shows a **provenance** badge linking back to the exact commit and workflow run that produced it.

## Notes and limits

- Publishing a GitHub **pre-release** also triggers the workflow and publishes to npm under the default `latest` tag. If you adopt prerelease versions, add a `--tag` flag or a `types: [released]` filter before relying on that behaviour.
- If trusted publishing ever misbehaves, the npmjs.com package settings page shows trusted-publisher errors directly on the failed attempt — check there first.
- Upgrading the npm CLI inside the workflow exists because the runner's bundled npm may predate trusted publishing support (npm 11.5.1 or later is required). Pin a specific npm version if you want fully reproducible publishes.
