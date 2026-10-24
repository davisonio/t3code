# Draft Ideas discussion (not posted; Craig chose "hold")

Update before posting: mobile controls live in the thread settings sheet, the label may change (see review-r2-opus.md), and stale defaults now fall through.

**Title:** Per-model defaults for new threads: model options and access mode

## Problem

Different models need different settings. I run Claude Opus 5.5 at High effort in Auto, and GPT-6 Luna at Max in Full access. T3 can't hold that:

- Settings > New threads has one default model (with its options) and one access mode, plus project overrides.
- Any other model starts with the options I last used for it on this device. That memory is per device, and every one-off change in a thread becomes the next default (#22597 is the Fast version of this).
- Agent launches (`t3_thread_launch`, `delegate_task`, `create_threads`, `schedule_task`, `t3 thread start`) can't see device memory. A child on another model runs at that model's shipped default unless the agent passes options every time.
- A single global effort can't work: models offer different levels, and some have no Extra High or Max.

## Proposal

An optional default per model: its options (whatever its descriptors offer: effort, Fast, context window) and an access mode. Keyed by provider instance and model slug, stored in server settings so every client and agent on the environment sees the same value:

```jsonc
"modelDefaults": {
  "claudeAgent": { "claude-opus-5-5": { "options": [{ "id": "effort", "value": "high" }], "runtimeMode": "auto" } },
  "codex": { "gpt-6-luna": { "options": [{ "id": "reasoningEffort", "value": "max" }], "runtimeMode": "full-access" } }
}
```

A model's default beats environment-wide defaults and device memory, but not what I pick for this thread or set for this project. One shared function resolves it for the server, web and mobile, so the composer shows what will run:

1. My pick in the composer for this thread
2. Project overrides (as today)
3. The model's default (new)
4. Settings > New threads, device memory, carry from the current thread (as today)
5. The model's own default, left to the provider

Agents: explicit options, then today's same-model inheritance from the parent, then the model's default. A default access mode never goes above the caller's own mode, like today's ceiling.

Stored options are checked against the model's current descriptors when applied. An option the model no longer offers is dropped, so a stale default falls back instead of failing.

Existing threads keep their settings. With no defaults set, nothing changes.

Setting one: "Use as default for <model>" in the composer's effort and access menus, with "Clear default" next to it, on web, desktop and mobile (the shortcut #15826 asks for). The menu's Default label moves to the saved value.

## Scope

Two PRs: model options first, access mode second. Access mode has its own history (#3086, #11346, #17125), so it can be judged on its own.

Related: #15826, #17125, #22597, #23959, #6508, #16833.

Would you take this direction? Happy to change the shape first, e.g. a Settings list instead of the composer menu.

Drafted with Claude Opus 5.5 in T3 Code.
