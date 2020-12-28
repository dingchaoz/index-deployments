import { BuidlerRuntimeEnvironment } from "@nomiclabs/buidler/types";
import { getLastDeploymentStage, writeStateToOutputs } from "@utils/deploys/output-helper";

export function trackFinishedStage(
  currentStage: number,
  func: (env: BuidlerRuntimeEnvironment) => Promise<void>
): (env: BuidlerRuntimeEnvironment) => Promise<void> {
  return async (env: BuidlerRuntimeEnvironment) => {
    await func(env);

    await writeStateToOutputs("last_deployment_stage", currentStage);
  };
}

export function stageAlreadyFinished(currentStage: number): (env: BuidlerRuntimeEnvironment) => Promise <boolean> {
  return async (env: BuidlerRuntimeEnvironment) => {
    const lastStage = await getLastDeploymentStage();

    return currentStage < lastStage;
  };
}