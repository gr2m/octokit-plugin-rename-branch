import { Octokit as Core } from "@octokit/core";
import { paginateRest } from "@octokit/plugin-paginate-rest";
import { renameBranch } from "../src";

const Octokit = Core.plugin(paginateRest, renameBranch);

test("no branch protection", async () => {
  const fixtures = require("./fixtures/no-branch-protection");
  const octokit = new Octokit();

  octokit.hook.wrap("request", (_, options) => {
    const currentFixtures = fixtures.shift();
    const { baseUrl, method, url, request, headers, mediaType, ...params } =
      options;

    expect(currentFixtures.request.method).toEqual(options.method);
    expect(currentFixtures.request.url).toEqual(options.url);

    Object.keys(params).forEach((paramName) => {
      expect(currentFixtures.request[paramName]).toStrictEqual(
        params[paramName]
      );
    });

    return currentFixtures.response;
  });

  await octokit.renameBranch({
    owner: "gr2m",
    repo: "rename-branch-test",
    current_name: "master",
    name: "main",
  });

  expect(fixtures.length).toEqual(0);
});
