import "module-alias/register";

import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import {
  prepareDeployment,
  findDependency,
  getContractAddress,
  getCurrentStage,
  writeContractAndTransactionToOutputs,
  stageAlreadyFinished,
  trackFinishedStage,
  DEPENDENCY,
  EMPTY_BYTES,
} from "@deployments/utils";

import { getRandomAddress } from "@utils/index";

import {
  CONTRACT_NAMES,
  IC_MANAGER,
} from "@deployments/constants/001_ic_manager";

const {
  DFP_MULTI_SIG,
  DPI,
  SINGLE_INDEX_MODULE,
  STREAMING_FEE_MODULE,
  TREASURY_MULTI_SIG,
} = DEPENDENCY;

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (hre: HRE) {
  const { deploy, deployer } = await prepareDeployment(hre);

  await polyFillForDevelopment();

  await deployICManager();

  //
  // Helper Functions
  //

  async function polyFillForDevelopment(): Promise<void> {
    if (await findDependency(DPI) === "") {
      await writeContractAndTransactionToOutputs(DPI, await getRandomAddress(), EMPTY_BYTES, "Created Mock DPI");
    }

    if (await findDependency(SINGLE_INDEX_MODULE) === "") {
      await writeContractAndTransactionToOutputs(SINGLE_INDEX_MODULE, await getRandomAddress(), EMPTY_BYTES, "Created Mock SINGLE_INDEX_MODULE");
    }

    if (await findDependency(STREAMING_FEE_MODULE) === "") {
      await writeContractAndTransactionToOutputs(STREAMING_FEE_MODULE, await getRandomAddress(), EMPTY_BYTES, "Created Mock STREAMING_FEE_MODULE");
    }

    console.log("Polyfilled dependencies");
  }

  async function deployICManager(): Promise<void> {
    const checkSingleIndexModuleAddress = await getContractAddress(CONTRACT_NAMES.IC_MANAGER);
    if (checkSingleIndexModuleAddress === "") {
      const params: string[] = [
        await findDependency(DPI),
        await findDependency(SINGLE_INDEX_MODULE),
        await findDependency(STREAMING_FEE_MODULE),
        await findDependency(TREASURY_MULTI_SIG),
        await findDependency(DFP_MULTI_SIG),
        IC_MANAGER.FEE_SPLIT,
      ];
      const indexDeploy = await deploy(CONTRACT_NAMES.IC_MANAGER, { from: deployer, args: params, log: true });
      indexDeploy.receipt && await writeContractAndTransactionToOutputs(
        CONTRACT_NAMES.IC_MANAGER,
        indexDeploy.address,
        indexDeploy.receipt.transactionHash,
        "Deployed ICManager"
      );
    }
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;