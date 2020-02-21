module.exports = renameBranch;

async function renameBranch(
  octokit,
  { owner, repo, current_name: currentName, name }
) {
  if (!octokit.paginate) {
    throw new Error(
      "[octokit-rename-branch] The @octokit/plugin-paginate-rest plugin is required"
    );
  }

  // get ref of last commit to <currentName> branch
  const {
    data: {
      object: { sha }
    }
  } = await octokit.request("GET /repos/:owner/:repo/git/ref/:ref", {
    owner,
    repo,
    ref: `heads/${currentName}`
  });

  // create new <name> branch
  await octokit.request("POST /repos/:owner/:repo/git/refs", {
    owner,
    repo,
    ref: `refs/heads/${name}`,
    sha
  });

  // set repository’s default branch to <name>
  await octokit.request("PATCH /repos/:owner/:repo", {
    owner,
    repo,
    name: repo,
    default_branch: name
  });

  // update branch protection patterns
  const query = `query($owner: String!, $repo: String!) {
    repository(owner:$owner,name:$repo) {
      branchProtectionRules(first:100) {
        nodes {
          id
          pattern
        }
      }
    }
  }`;
  const {
    repository: {
      branchProtectionRules: { nodes: branchProtectionRules }
    }
  } = await octokit.graphql(query, { owner, repo });

  // there can only be one protection per pattern
  const { id } = branchProtectionRules.find(
    rule => rule.pattern === currentName
  );
  await octokit.graphql(
    `mutation($branchProtectionRuleId:ID!,$pattern:String!) {
      updateBranchProtectionRule (input:{branchProtectionRuleId:$branchProtectionRuleId,pattern:$pattern}) {
        branchProtectionRule {
          id,
          pattern
        }
      }
    }`,
    {
      branchProtectionRuleId: id,
      pattern: name
    }
  );

  // Iterate trough all open pull requests with base = <currentName>
  // and change base to <name>
  for await (const { data: pullRequests } of octokit.paginate.iterator(
    "GET /repos/:owner/:repo/pulls",
    {
      owner,
      repo,
      state: "open",
      base: currentName
    }
  )) {
    await pullRequests.reduce(async (promise, { number }) => {
      await promise;
      return octokit.request("PATCH /repos/:owner/:repo/pulls/:pull_number", {
        owner,
        repo,
        number,
        base: name
      });
    }, Promise.resolve());
  }

  // delete <currentName> branch
  await octokit.request("DELETE /repos/:owner/:repo/git/refs/:ref", {
    owner,
    repo,
    ref: `heads/${currentName}`
  });
}
