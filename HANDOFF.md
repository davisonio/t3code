# Handoff: per-model default options (upstream PR 1 of 2)

Paused 2026-10-24 because the laptop was closing. Delete this file and `handoff/` before opening the upstream PR.

## Where things are

- Branch `feat/per-model-defaults` (worktree `/Users/craig/.t3/worktrees/t3code/feat-per-model-defaults`), based on upstream/main `4812dcad02`, pushed to origin (davisonio/t3code). Nothing posted upstream.
- Craig chose "hold, don't post yet" for the proposal and "idk yet" on the design choices. The draft proposal is in the thread history (its text is summarised in `handoff/pr1-body.md`). Do not post or open anything without Craig's OK and a maintainer's approval of an Ideas discussion (CONTRIBUTING.md).
- Feature: `ServerSettings.modelDefaults` keyed by provider instance + model slug, patch op `setModelDefaults`, capability `modelDefaults`. Order for a new thread: options picked/passed/inherited > project's own default options for that model > saved model default > today's behaviour. Shared resolvers: `resolveModelDefaultOptions` / `withModelDefaultOptions` (packages/shared/src/model.ts), `withNewThreadModelDefaultOptions` (packages/shared/src/projectSettings.ts), client helpers `readModelDefault` / `modelDefaultPatch` (packages/client-runtime/src/modelTraits.ts). UI: "Set as default for new threads" / "Clear default" in the web traits menu and mobile thread settings sheet.

## Done

- Tests first (Haiku 5.5, shown failing before the change) in serverSettings, project handlers, OrchestratorMcpService, web composerDraftStore, mobile modelOptions. All pass.
- Real web client on an isolated dev server: default beats device memory for new threads and model picks; set/clear; badge moves.
- Live Codex runtime: composer turn ran at the saved effort; `t3 thread start` and a real `delegate_task` to GPT-6 Luna with no options ran at Luna's saved effort.
- iOS simulator: set/clear from the thread settings sheet, cross-device with web, a fresh new task opens at the saved default. Captures: `/Users/craig/dev/.worktrees/t3code/pmd-evidence/` (not in the repo).
- Final `vp run check:changed`: format, lint, knip, typecheck (29 packages) pass; tests 328/329, the one failure is a macOS `/var` vs `/private/var` path in `ServerEnvironment.test.ts`, unrelated.

## Left

1. Address Opus round-2 review: `handoff/review-r2-opus.md` (6 must-fix items, incl. Settings picker truthfulness, schedule_task using the shared function, agents seeing defaults in orchestrator_capabilities, a real fall-through test, boundary decode tests, user docs `docs/user/composer.md`). Grok round 2 was cancelled at wrap-up; re-run it (and Opus) on the fixed diff with the earlier findings and answers included.
2. Rename the controls (reviewer suggestion: "Save as default options" / "Clear default options") and keep the per-option "Default" badge meaning the provider default.
3. Web before/after captures for the PR (the T3 Browser panel's snapshot tool timed out on the dev app).
4. Craig's open design questions: project override vs model default precedence; agents' same-model inheritance; UI placement. They gate PR 2 (per-model default access mode), not started.
5. Show Craig the proposal again, post it as an Ideas discussion once he approves, wait for maintainer approval, then open the PR with `handoff/pr1-body.md` (update its Verification section).
