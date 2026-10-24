import { useAtomValue } from "@effect/atom-react";
import type {
  EnvironmentId,
  ProviderInstanceId,
  ProviderOptionSelection,
  ServerProviderModel,
} from "@t3tools/contracts";
import { resolveModelDefaultOptions } from "@t3tools/shared/model";
import { serverEnvironment } from "~/state/server";
import { useAtomCommand } from "~/state/use-atom-command";

export function useModelDefault(input: {
  readonly environmentId: EnvironmentId | null;
  readonly instanceId: ProviderInstanceId | null;
  readonly model: string | null;
  readonly models: ReadonlyArray<ServerProviderModel>;
}) {
  const { environmentId, instanceId, model, models } = input;
  const config = useAtomValue(serverEnvironment.configValueAtom(environmentId));
  const save = useAtomCommand(serverEnvironment.updateSettings, "model default update");
  const settings = config?.settings;
  if (
    !environmentId ||
    !settings ||
    config.environment.capabilities.modelDefaults !== true ||
    !instanceId ||
    !model
  )
    return null;
  return {
    options: resolveModelDefaultOptions(settings, { instanceId, model }, [{ instanceId, models }]),
    set: (options: ReadonlyArray<ProviderOptionSelection> | null) =>
      save({
        environmentId,
        input: { patch: { setModelDefaults: [{ provider: instanceId, model, options }] } },
      }),
  };
}
