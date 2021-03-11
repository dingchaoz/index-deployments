import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getLastDeploymentStage, writeStateToOutputs } from "@deployments/utils/deploys/outputHelper";

export function trackFinishedStage(
  currentStage: number,
  func: (env: HardhatRuntimeEnvironment) => Promise<void>
): (env: HardhatRuntimeEnvironment) => Promise<void> {
  return async (env: HardhatRuntimeEnvironment) => {
    await func(env);

    await writeStateToOutputs("last_deployment_stage", currentStage + 1);
  };
}

export function stageAlreadyFinished(currentStage: number): (env: HardhatRuntimeEnvironment) => Promise <boolean> {
  return async (env: HardhatRuntimeEnvironment) => {
    const lastStage = await getLastDeploymentStage();

    return currentStage < lastStage;
  };
}