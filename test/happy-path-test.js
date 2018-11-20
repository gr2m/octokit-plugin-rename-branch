const { test } = require('tap')

const Octokit = require('@octokit/rest')
  .plugin(require('..'))

test('happy path', async t => {
  const fixtures = require('./fixtures/happy-path')
  const octokit = new Octokit()

  octokit.hook.wrap('request', (_, options) => {
    const currentFixtures = fixtures.shift()
    const { baseUrl, method, url, request, headers, ...params } = options

    t.equal(currentFixtures.request.method, options.method)
    t.equal(currentFixtures.request.url, options.url)

    Object.keys(params).forEach(paramName => {
      t.equal(currentFixtures.request[paramName], params[paramName])
    })
    return currentFixtures.response
  })

  await octokit.renameBranch({
    owner: 'gr2m',
    repo: 'rename-branch-test',
    current_name: 'master',
    name: 'latest'
  })

  t.equal(fixtures.length, 0)
})
