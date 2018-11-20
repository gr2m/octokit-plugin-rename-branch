# octokit-rename-branch

> Octokit plugin to rename a branch in a github repository

# :construction: [WORK IN PROGRESS](https://github.com/gr2m/octokit-rename-branch/pull/1)

## Usage

Install with `npm install @octokit/rest octokit-rename-branch`

```js
const Octokit = require('@octokit/rest')
  .plugin(require('octokit-rename-branch'))
const octokit = new Octokit()

octokit.authenticate({
  type: 'token',
  token:
})
octokit.renameBranch({
  owner: 'octocat',
  repo: 'hello-world',
  current_name: 'master',
  name: 'latest'
})
```

## How it works

1. Creates a new reference using the `sha` of the last commit of `current_branch`
   ([`POST /repos/:owner/:repo/git/refs`](https://developer.github.com/v3/git/refs/#create-a-reference))
2. Updates the default branch of the repository ([`PATCH /repos/:owner/:repo`](https://developer.github.com/v3/repos/#edit))
3. Look for open pull requests and update the base branch if it’s `current_branch` ([`PATCH /repos/:owner/:repo/pulls/:number`](https://developer.github.com/v3/pulls/#update-a-pull-request))
4. Delete `current_branch` ([`DELETE /repos/:owner/:repo/git/refs/:ref`](https://developer.github.com/v3/git/refs/#delete-a-reference))

## Motivation

I think `master` is a horrific term. `git` & GitHub should follow the lead of
tech communities such as [Django](https://github.com/django/django/pull/2692),
[Drupal](https://www.drupal.org/project/drupal/issues/2275877) and
[CouchDB](https://issues.apache.org/jira/browse/COUCHDB-2248) and replace
`master` with non-offensive term, such as `latest`. This library is meant to
simplify the process of renaming branch names of GitHub repositories.

## License

[MIT](LICENSE)
