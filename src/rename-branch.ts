import { Octokit } from "@octokit/core";
import { composePaginateRest } from "@octokit/plugin-paginate-rest";

type Options = {
  owner: string;
  repo: string;
  current_name: string;
  name: string;
};

type Rule = {
  pattern: string;
};

type PullRequest = {
  number: number;
};

export async function composeRenameBranch(
  octokit: Octokit,
  { owner, repo, current_name: currentName, name }: Options
) {
  // get ref of last commit to <currentName> branch
  const {
    data: {
      object: { sha },
    },
  } = await octokit.request("GET /repos/:owner/:repo/git/ref/:ref", {
    owner,
    repo,
    ref: `heads/${currentName}`,
  });

  // create new <name> branch
  await octokit.request("POST /repos/:owner/:repo/git/refs", {
    owner,
    repo,
    ref: `refs/heads/${name}`,
    sha,
  });

  // set repository’s default branch to <name>
  await octokit.request("PATCH /repos/:owner/:repo", {
    owner,
    repo,
    name: repo,
    default_branch: name,
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
      branchProtectionRules: { nodes: branchProtectionRules },
    },
  } = await octokit.graphql(query, { owner, repo });

  // there can only be one protection per pattern
  const branchProtection = branchProtectionRules.find(
    (rule: Rule) => rule.pattern === currentName
  );

  if (branchProtection) {
    const { id } = branchProtection;
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
        pattern: name,
      }
    );
  }

  // Iterate trough all open pull requests with base = <currentName>
  // and change base to <name>
  for await (const { data: pullRequests } of composePaginateRest.iterator(
    octokit,
    "GET /repos/:owner/:repo/pulls",
    {
      owner,
      repo,
      state: "open",
      base: currentName,
    }
  )) {
    await pullRequests.reduce(
      // @ts-expect-error composePaginateRest.iterator does not return correct types yet
      async (promise: Promise<any>, { number }: PullRequest) => {
        await promise;
        return octokit.request("PATCH /repos/:owner/:repo/pulls/:pull_number", {
          owner,
          repo,
          pull_number: number,
          base: name,
        });
      },
      Promise.resolve()
    );
  }

  // delete <currentName> branch
  await octokit.request("DELETE /repos/:owner/:repo/git/refs/:ref", {
    owner,
    repo,
    ref: `heads/${currentName}`,
  });
}
