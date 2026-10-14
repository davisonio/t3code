import type { VcsRef } from "@t3tools/contracts";

/**
 * The base branch a new worktree task starts from when none is chosen. Like a
 * new worktree thread: the repo's default branch (origin/HEAD), else the
 * checked-out branch, so repositories without `main` still work.
 */
export function defaultWorktreeBaseRef(
  refs: ReadonlyArray<Pick<VcsRef, "name" | "isDefault" | "current">>,
): string {
  return (refs.find((ref) => ref.isDefault) ?? refs.find((ref) => ref.current))?.name ?? "";
}
