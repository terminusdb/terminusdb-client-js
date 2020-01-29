# Contributing to Terminus Client

Thanks for your interest in contributing to Terminus Client. To get started, fork this repo and follow the [instruction setting up dev environment](#setting-up-dev-environment). If you don't have idea where to start, you can look for [`good first issue`](https://github.com/terminusdb/terminus-client/contribute) or the `help wanted` label at issues. All pull requests should follow the [Pull Request Format Guideline](#pull-request-format-guideline) and pull requests (PR) that involving coding should come with [tests](#writing-tests-and-testing) and [documentation](#writing-documentation). **All pull request should be made towards `dev` branch**

## Setting up dev environment

Make sure you have [npm installed](https://www.npmjs.com/get-npm). [Fork and clone](https://help.github.com/en/github/getting-started-with-github/fork-a-repo) this repo, then in your local repo:

`npm install`

## Writing tests and testing

We are using [`chai`](https://www.chaijs.com/) and [`mocha`](https://mochajs.org/) module for testing. All tests are stored in `/test`

To run the tests and coverage:

`npm run cover`

## Writing Documentation

Please follow JSDoc for documentation. (Cheatsheet available [here](https://devhints.io/jsdoc)) It is important to follow the formatting as all documentation will be automatically rendered form the JSDoc.

## Pull Request Format Guideline

Please put the type of the pull request in the title:

* [Doc] for documentation
* [Bug] for bug fixes
* [Feature] for new features
* [WIP] for work in progress (will not be reviewed)

Also, if there is a related issues, please also put the issue numbers in blankets in the title, for example: (#10)

It would be great if you could describe what you have done in the pull request (more detail the better). If there is an issue that can be closed by this PR, you can put `Close #XX` or `Fix #XX` (while XX is the issue number) to close that issue automatically when your PR is merged.

Following the guideline makes the reviewing process of the PR much efficient.
