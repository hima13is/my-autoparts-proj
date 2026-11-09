import { describe, expect, it } from "vitest";

// Deliberately failing test: proves a red CI check blocks merging into main.
// This branch is thrown away after the demo.
describe("CI gate demo", () => {
  it("fails on purpose", () => {
    expect(1 + 1).toBe(3);
  });
});
