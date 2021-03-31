import { renameBranch, composeRenameBranch } from "../src";

describe("Smoke test", () => {
  it("renameBranch is a function", () => {
    expect(renameBranch).toBeInstanceOf(Function);
  });

  it("renameBranch.VERSION is set", () => {
    expect(renameBranch.VERSION).toEqual("0.0.0-development");
  });

  it("composeRenameBranch is a function", () => {
    expect(composeRenameBranch).toBeInstanceOf(Function);
  });
});
