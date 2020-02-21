module.exports = octokitRenameBranch;

const renameBranch = require("./lib/rename-branch");

function octokitRenameBranch(octokit) {
  octokit.renameBranch = renameBranch.bind(null, octokit);
}
