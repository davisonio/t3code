import { useAtomValue } from "@effect/atom-react";
import { modelDefaultPatch, readModelDefault } from "@t3tools/client-runtime/model-traits";
import type {
  EnvironmentId,
  ProviderInstanceId,
  ProviderOptionSelection,
} from "@t3tools/contracts";
import { serverEnvironment } from "~/state/server";
import { useAtomCommand } from "~/state/use-atom-command";

export function useModelDefault(input: {
  readonly environmentId: EnvironmentId | null;
  readonly instanceId: ProviderInstanceId | null;
  readonly model: string | null;
}) {
  const { environmentId, instanceId, model } = input;
  const config = useAtomValue(serverEnvironment.configValueAtom(environmentId));
  const save = useAtomCommand(serverEnvironment.updateSettings, "model default update");
  const selection = instanceId && model ? { instanceId, model } : null;
  const modelDefault = readModelDefault(config, selection);
  if (!environmentId || !selection || !modelDefault) return null;
  return {
    options: modelDefault.options,
    set: (options: ReadonlyArray<ProviderOptionSelection> | null) =>
      save({ environmentId, input: { patch: modelDefaultPatch(selection, options) } }),
  };
}
