import "module-alias/register";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { EMPTY_BYTES } from "@deployments/utils/constants";
import {
  ensureOutputsFile,
  findDependency,
  getContractAddress,
  getNetworkConstant,
  removeNetwork,
  getCurrentStage,
  writeContractAndTransactionToOutputs,
} from "@deployments/utils/deploys/outputHelper";
import { getRandomAddress } from "@utils/index";
import { stageAlreadyFinished, trackFinishedStage } from "@deployments/utils";
import { DEPENDENCY } from "@deployments/utils/deploys/dependencies";
import {
  CONTRACT_NAMES,
  OUTPUT_NAMES,
  IC_MANAGER,
} from "@deployments/constants/005_cgci_ic_manager";

const {
  COINSHARES_MULTI_SIG,
  CGCI,
  SINGLE_INDEX_MODULE,
  STREAMING_FEE_MODULE,
  TREASURY_MULTI_SIG,
} = DEPENDENCY;

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (bre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = bre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  // Configure development deployment
  const networkConstant = await getNetworkConstant();
  try {
    if (networkConstant === "development") {
      console.log(`\n*** Clearing all addresses for ${networkConstant} ***\n`);
      await removeNetwork(networkConstant);
    }
  } catch (error) {
    console.log("*** No addresses to wipe *** ");
  }

  await ensureOutputsFile();

  await polyFillForDevelopment();

  await deployICManager();

  //
  // Helper Functions
  //

  async function polyFillForDevelopment(): Promise<void> {
    if (await findDependency(CGCI) === "") {
      await writeContractAndTransactionToOutputs(CGCI, await getRandomAddress(), EMPTY_BYTES, "Created Mock CGCI");
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
    const checkSingleIndexModuleAddress = await getContractAddress(OUTPUT_NAMES.IC_MANAGER);
    if (checkSingleIndexModuleAddress === "") {
      const params: string[] = [
        await findDependency(CGCI),
        await findDependency(SINGLE_INDEX_MODULE),
        await findDependency(STREAMING_FEE_MODULE),
        await findDependency(TREASURY_MULTI_SIG),
        await findDependency(COINSHARES_MULTI_SIG),
        IC_MANAGER.FEE_SPLIT,
      ];
      const indexDeploy = await deploy(CONTRACT_NAMES.IC_MANAGER, { from: deployer, args: params, log: true });
      indexDeploy.receipt && await writeContractAndTransactionToOutputs(
        OUTPUT_NAMES.IC_MANAGER,
        indexDeploy.address,
        indexDeploy.receipt.transactionHash,
        "Deployed ICManager-CGCI"
      );
    }
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;