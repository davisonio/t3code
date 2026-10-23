import type { ModelSelection, ProviderOptionSelection, ServerConfig } from "@t3tools/contracts";
import { resolveModelDefaultOptions } from "@t3tools/shared/model";
import { appAtomRegistry } from "./atom-registry";
import {
  modelOptionMemoryAtom,
  schedulePersistComposerState,
  type ModelOptionMemoryState,
} from "./use-composer-drafts";

function recordModelOptionsInState(
  state: ModelOptionMemoryState,
  instanceId: string,
  model: string,
  options: ReadonlyArray<ProviderOptionSelection>,
): ModelOptionMemoryState {
  if (options.length === 0) {
    return state;
  }
  return {
    ...state,
    [instanceId]: {
      ...(state[instanceId] ?? {}),
      [model]: options,
    },
  };
}

function lookupModelOptionsInState(
  state: ModelOptionMemoryState,
  instanceId: string,
  model: string,
): ReadonlyArray<ProviderOptionSelection> | undefined {
  return state[instanceId]?.[model];
}

export function rememberModelOptions(
  instanceId: string,
  model: string,
  options: ReadonlyArray<ProviderOptionSelection>,
): void {
  if (options.length === 0) {
    return;
  }
  const current = appAtomRegistry.get(modelOptionMemoryAtom);
  const next = recordModelOptionsInState(current, String(instanceId), model, options);
  if (next !== current) {
    appAtomRegistry.set(modelOptionMemoryAtom, next);
    schedulePersistComposerState();
  }
}

export function rememberedModelOptions(
  instanceId: string,
  model: string,
): ReadonlyArray<ProviderOptionSelection> | undefined {
  return lookupModelOptionsInState(
    appAtomRegistry.get(modelOptionMemoryAtom),
    String(instanceId),
    model,
  );
}

export function withRememberedModelOptions<T extends ModelSelection>(
  selection: T,
  config?: Pick<ServerConfig, "settings" | "providers"> | null,
): T {
  const remembered =
    (config?.settings
      ? resolveModelDefaultOptions(config.settings, selection, config.providers)
      : undefined) ?? rememberedModelOptions(selection.instanceId, selection.model);
  if (
    remembered === undefined ||
    JSON.stringify(remembered) === JSON.stringify(selection.options ?? [])
  ) {
    return selection;
  }
  return { ...selection, options: remembered };
}
