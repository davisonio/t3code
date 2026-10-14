import { describe, expect, it } from "vite-plus/test";

import { defaultWorktreeBaseRef } from "./scheduledTaskBaseRef.ts";

const ref = (name: string, flags: { isDefault?: boolean; current?: boolean } = {}) => ({
  name,
  isDefault: flags.isDefault ?? false,
  current: flags.current ?? false,
});

describe("defaultWorktreeBaseRef", () => {
  it("starts from the repo's default branch, not main", () => {
    expect(
      defaultWorktreeBaseRef([
        ref("feature", { current: true }),
        ref("master", { isDefault: true }),
      ]),
    ).toBe("master");
  });
  it("falls back to the checked-out branch when no default is known", () => {
    expect(defaultWorktreeBaseRef([ref("trunk", { current: true }), ref("other")])).toBe("trunk");
  });
  it("leaves the choice empty while refs are unknown", () => {
    expect(defaultWorktreeBaseRef([])).toBe("");
  });
});
