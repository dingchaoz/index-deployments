import "module-alias/register";

import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import {
  ensureOutputsFile,
  getCurrentStage,
  stageAlreadyFinished,
  trackFinishedStage,
  prepareDevelopmentDeployment,
  deployMerkleDistributor,
} from "@deployments/utils";
import {
  CONTRACT_NAMES,
  MERKLE_ROOT_OBJECT,
} from "@deployments/constants/014_apr_21_coop_rewards";

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (hre: HRE) {
  await prepareDevelopmentDeployment();
  await ensureOutputsFile();

  await deployMerkleDistributor(
    CONTRACT_NAMES.INDEX_TOKEN,
    CONTRACT_NAMES.MERKLE_DISTRIBUTOR,
    MERKLE_ROOT_OBJECT,
    CONTRACT_NAMES.REWARDS_APR21_MERKLE_DISTRIBUTOR,
    hre
  );
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;
