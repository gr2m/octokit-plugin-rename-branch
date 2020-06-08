import { renameBranch } from "../src";

describe("Smoke test", () => {
  it("is a function", () => {
    expect(renameBranch).toBeInstanceOf(Function);
  });

  it("renameBranch.VERSION is set", () => {
    expect(renameBranch.VERSION).toEqual("0.0.0-development");
  });
});
