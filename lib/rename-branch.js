module.exports = renameBranch

async function renameBranch (octokit, { owner, repo, current_name: currentName, name }) {
  // get ref of last commit to <currentName> branch
  const {
    data: {
      object: {
        sha
      }
    }
  } = await octokit.gitdata.getRef({
    owner,
    repo,
    ref: `heads/${currentName}`
  })

  // create new <name> branch
  await octokit.gitdata.createRef({
    owner,
    repo,
    ref: `refs/heads/${name}`,
    sha
  })

  // set repository’s default branch to <name>
  await octokit.repos.update({
    owner,
    repo,
    name: repo,
    default_branch: name
  })

  // update branch protection patterns
  const query = `{
    repository(owner:"${owner}",name:"${repo}") {
      branchProtectionRules(first:100) {
        nodes {
          id
          pattern
        }
      }
    }
  }`
  const {
    data: { data: { repository: { branchProtectionRules: { nodes: branchProtectionRules } } } }
  } = await octokit.request('POST /graphql', { query })

  // there can only be one protection per pattern
  const { id } = branchProtectionRules.find(rule => rule.pattern === currentName)
  await octokit.request('POST /graphql', {
    query: `mutation {
      updateBranchProtectionRule (input:{branchProtectionRuleId:"${id}",pattern:"${name}"}) {
        branchProtectionRule {
          id,
          pattern
        }
      }
    }`
  })

  // Iterate trough all open pull requests with base = <currentName>
  // and change base to <name>
  const options = octokit.pullRequests.list.endpoint.merge({
    owner,
    repo,
    state: 'open',
    base: currentName
  })
  for await (const { data: pullRequests } of octokit.paginate.iterator(options)) {
    await pullRequests.reduce(async (promise, { number }) => {
      await promise
      return octokit.pullRequests.update({
        owner,
        repo,
        number,
        base: name
      })
    }, Promise.resolve())
  }

  // delete <currentName> branch
  await octokit.gitdata.deleteRef({
    owner,
    repo,
    ref: `heads/${currentName}`
  })
}
