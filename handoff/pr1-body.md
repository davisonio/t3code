feat: new threads start with a model's saved default options

## Problem

Models need different settings, but T3 can only hold one default model (with its options) per environment or project. Any other model starts with whatever options were last used for it on this device, which drifts with every one-off change and differs between devices. Agent launches (`t3_thread_launch`, `delegate_task`, `create_threads`, `schedule_task`, `t3 thread start`) can't see device memory at all, so a child on another model runs at that model's shipped default unless the agent passes options every time. A single global effort default can't work either: models offer different levels.

Approved direction: <LINK TO MAINTAINER APPROVAL IN IDEAS DISCUSSION>

## Change

An optional default per model, keyed by provider instance and model slug, stored in server settings (`modelDefaults`) so every client and agent on the environment sees it. Set it where the options are picked: "Set as default for new threads" and "Clear default" in the composer's effort menu on web and desktop, and in the thread settings sheet on mobile. On web the menu's Default label moves to the saved value. The controls only appear when the server advertises the new `modelDefaults` capability.

A new thread's options resolve in this order, through one shared function (`withNewThreadModelDefaultOptions` in `@t3tools/shared/projectSettings`) used by the server, web and mobile, so the composer shows what will run:

1. Options picked in the composer for this thread, or passed/inherited by an agent
2. The project's own default options for that model (project overrides keep winning)
3. The model's saved default (new)
4. What T3 does today: environment default options, options carried from the current thread, last used on this device, else the provider's own default

Agents keep today's documented inheritance: a child on the same instance and model as its parent still inherits the parent's options; a child on another model gets that model's default. Stored options are checked against the model's current descriptors when applied, so an option the model no longer offers (or a prompt-injected value like ultrathink) is dropped instead of failing the launch.

With no defaults saved, nothing changes. Existing threads keep their own options; picking a model in a thread uses its default before device memory, the same as a new thread.

## Version skew

- New client, old server: the server has no `modelDefaults` capability, so the composer hides the set/clear items. Resolution falls back to today's behaviour because the settings carry no defaults.
- Old client, new server: the client ignores `modelDefaults` and sends the options it shows. The server applies defaults only on agent entry points, never on client launches, so an old client never runs something other than what it displays.

## Verification

- Tests first, written by a separate model from the expected behaviour only and shown failing before the change: settings patch (`serverSettings.test.ts`), `t3_thread_launch` (`handlers.test.ts`), `delegate_task` (`OrchestratorMcpService.test.ts`), web composer resolution (`composerDraftStore.test.ts`), mobile new-task resolution (`modelOptions.test.ts`). All pass with the change.
- Real web client on an isolated dev server with seeded data: saved High as GPT-5.6-Terra's default, set this device's memory to Low, and a new thread opened at High. Switching to GPT-6-Luna and back showed High again. Clear default removed it and the Default label went back to the provider's Medium.
- Live Codex runtime: the composer turn sent `effort: high` and Codex confirmed `reasoning_effort: high`, overriding the `max` from its own config.toml. `t3 thread start --provider codex --model gpt-6-luna` with no options ran Luna at its saved `low`. A Terra agent's `delegate_task` to Luna with no options returned `options: [reasoningEffort: low]` and the child ran at low.
- <PENDING: mobile simulator pass; before/after captures; final check:changed>

Made with Claude Opus 5.5 in Claude Code, running inside T3 Code.
