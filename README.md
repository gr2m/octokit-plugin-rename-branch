# octokit-plugin-rename-branch

> Octokit plugin to rename a branch in a github repository

[![@latest](https://img.shields.io/npm/v/octokit-plugin-rename-branch.svg)](https://www.npmjs.com/package/octokit-plugin-rename-branch)
[![Build Status](https://github.com/gr2m/octokit-plugin-rename-branch/workflows/Test/badge.svg)](https://github.com/gr2m/octokit-plugin-rename-branch/actions?query=workflow%3ATest+branch%3Amaster)

## Usage

Install with `npm install @octokit/core octokit-plugin-rename-branch`

```js
const { Octokit } = require("@octokit/core");
const renameBranch = require("octokit-plugin-rename-branch");

const MyOctokit = Octokit.plugin(renameBranch);
const octokit = new MyOctokit({
  // create token at https://github.com/settings/tokens/new
  auth: "my-token-123",
});

octokit.renameBranch({
  owner: "octocat",
  repo: "hello-world",
  current_name: "master",
  name: "latest",
});
```

## How it works

1. Creates a new reference using the `sha` of the last commit of `current_branch`
   ([`POST /repos/:owner/:repo/git/refs`](https://developer.github.com/v3/git/refs/#create-a-reference))
2. Updates the default branch of the repository ([`PATCH /repos/:owner/:repo`](https://developer.github.com/v3/repos/#edit))
3. Updates branch protection to the new branch name if applicable ([GraphQL mutation `updateBranchProtectionRule`](https://developer.github.com/v4/mutation/updatebranchprotectionrule/))
4. Look for open pull requests and update the base branch if it’s `current_branch` ([`PATCH /repos/:owner/:repo/pulls/:pull_number`](https://developer.github.com/v3/pulls/#update-a-pull-request))
5. Delete `current_branch` ([`DELETE /repos/:owner/:repo/git/refs/:ref`](https://developer.github.com/v3/git/refs/#delete-a-reference))

## Motivation

I think `master` is a horrific term. `git` & GitHub should follow the lead of
tech communities such as [Django](https://github.com/django/django/pull/2692),
[Drupal](https://www.drupal.org/project/drupal/issues/2275877) and
[CouchDB](https://issues.apache.org/jira/browse/COUCHDB-2248) and replace
`master` with non-offensive term, such as `latest`. This library is meant to
simplify the process of renaming branch names of GitHub repositories.

## License

[MIT](LICENSE)
