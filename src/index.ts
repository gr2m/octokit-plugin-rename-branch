import { Octokit } from "@octokit/core";

import { composeRenameBranch } from "./rename-branch";
import { VERSION } from "./version";

/**
 * @param octokit Octokit instance
 */
export function renameBranch(octokit: Octokit) {
  return {
    renameBranch: composeRenameBranch.bind(null, octokit),
  };
}
renameBranch.VERSION = VERSION;

export { composeRenameBranch } from "./rename-branch";
