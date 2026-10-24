# Review round 2: Opus 5.5 (xhigh), maintainer-takeover brief (2026-10-24, not yet addressed)

## Must change before merge

1. Settings default-model picker shows a value that doesn't run. `apps/web/src/components/settings/ProjectDefaultsSettings.tsx:190` edits the default model's options, but `packages/shared/src/projectSettings.ts:37` lets a saved model default override them (test row `handlers.test.ts:399`). Settings can say High while new threads run Low. Recommendation: when the server has the capability, that picker reads/writes `modelDefaults` for its model.
2. "One shared function" isn't true yet.
   - `schedule_task` (`OrchestratorMcpService.ts:1836`) has its own rule (legacy `project.defaultModelSelection` options win, project overrides ignored), opposite of `t3_thread_launch`, untested. Route it through `resolveProjectSettings` + `withNewThreadModelDefaultOptions` like `handlers.ts:132`, add one test row.
   - Rule 2 (project's own options) is skipped by `delegate_task` (`OrchestratorMcpService.ts:1473`), web model picks (`useComposerSelection.ts:188`), mobile `withRememberedModelOptions` (`use-model-option-memory.ts:63`). Apply it there or say in the PR body where it doesn't apply.
3. Agents can't see the saved default. `orchestrator_capabilities` still reports the provider default per option (`OrchestratorMcpService.ts:362`); report the saved value. The delegate_task description (`toolkits/orchestrator/tools.ts:70`) says prefer native subagents when "no model options are requested or inherited"; native subagents skip the default, so add "or the target model has a saved default" there and in the injected orchestration instructions (`packages/provider-core/src/server/orchestrationInstructions.ts`).
4. The round-1 fall-through fix (`packages/shared/src/model.ts:532`) has no test that proves it. Rows `handlers.test.ts:393` (name now contradicts behaviour) and `OrchestratorMcpService.test.ts:2643` pass either way. Add: environment default Medium + stored `[ultra]` => Medium. Delete one of the two rows.
5. Contract not decoded at boundary values: only `decodeServerSettings({})` (`serverSettings.test.ts:969`). Decode `ServerSettingsPatch.setModelDefaults` with `options: null`, `options: []`, `options` missing (reject), blank model (reject). Make stored `options` required at `packages/contracts/src/settings.ts:1187`.
6. User docs wrong: `docs/user/composer.md:108` "Model defaults" says remembered options apply to new threads. Document the saved default's precedence and set/clear.

## Would prefer

1. Fewer, stronger tests: the precedence/descriptor matrix is re-tested in 4 files. Test it once in `packages/shared/src/projectSettings.test.ts`; keep one wiring row per entry point plus specifics (web explicit flag, mobile queued-task edit, delegate same-model inheritance). Drop the mobile "projectSettings omitted"/"providers omitted" rows (`modelOptions.test.ts:714`).
2. Performance: `apps/web/src/hooks/useModelDefault.ts:17` subscribes `ComposerControlsBar` to the whole `ServerConfig` (replaced on every provider status push, see `useHandleNewThread.ts:81`) and returns a new object/closure each render, defeating `memo(TraitsMenuContent)`. Select only the capability flag, this model's entry and descriptors; memoize.
3. Saving pins provider defaults: after any edit the web options hold every descriptor's value, so "Set as default" also saves untouched values like `fastMode: false`. Strip values equal to the descriptor default in `modelDefaultPatch` (`client-runtime/src/modelTraits.ts:32`). Replace the order-sensitive `JSON.stringify` comparisons (`TraitsPicker.tsx:530`, `ThreadSettingsSheet.tsx:973`) with one shared helper.
4. A fully stale default can't be cleared: `readModelDefault` returns `options: undefined`, so Clear disappears (`TraitsPicker.tsx:537`) while the entry stays stored. Expose a "stored" flag.
5. Partial explicit options replace the default instead of merging (tested at `OrchestratorMcpService.test.ts:2668`). Merge like inherited options, or say so in the tool description.
6. Placement/label: keep controls where options are picked; a Settings list is scope creep (item 1 makes Settings truthful). Rename to "Save as default options" / "Clear default options" (current label reads as "default model", collides with mobile's Default model chip, and the default also applies on model switches). Don't repurpose the per-option "Default" badge (`TraitsPicker.tsx:477`, still means provider default in Settings pickers); mark the saved value separately, e.g. "Saved".

## Checked and fine

Version skew both directions; replay fixtures unaffected; one problem per PR; remaining comments are real constraints; handler-inline resolution in `t3_thread_launch` accepted (but `schedule_task` should use the same shared function).
