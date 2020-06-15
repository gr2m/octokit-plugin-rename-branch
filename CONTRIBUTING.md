# Contributing

Please note that this project is released with a [Contributor Code of Conduct][coc].
By participating in this project you agree to abide by its terms.

## Running tests

All tests can be run with `npm test`. To run a single test, you can execute the test files directly with node, e.g.

```
node test/happy-path-test.js
```

or with the `tap` binary for nicer output.

```
npx tap test/happy-path-test.js
```

## Update test fixtures

Here is a script that records fixtures and logs them to stdout. Run with `GITHUB_TOKEN=... node my-script.js`. [Create token with repo scope](https://github.com/settings/tokens/new?scopes=repo).

Make sure to run `npm run build`, to make sure the `pkg/` folder is created and up-to-date.

```js
// my-script.js
const { Octokit } = require("@octokit/core");
const { paginateRest } = require("@octokit/plugin-paginate-rest");
const { renameBranch } = require("./pkg");
const MyOctokit = Octokit.plugin(renameBranch, paginateRest);
const octokit = new MyOctokit({
  auth: process.env.GITHUB_TOKEN,
});

const fixtures = [];
octokit.hook.after("request", (response, options) => {
  fixtures.push({
    request: options,
    response,
  });
});

octokit
  .renameBranch({
    owner: "gr2m",
    repo: "sandbox",
    current_name: "master",
    name: "main",
  })

  .then(() => {
    fixtures.forEach((fixture) => {
      if (fixture.request.headers.authorization) {
        fixture.request.headers.authorization = "token secret";
      }
    });

    console.log(JSON.stringify(fixtures, null, 2));
  });
```

[coc]: ./CODE_OF_CONDUCT.md
