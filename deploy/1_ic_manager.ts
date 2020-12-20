import "module-alias/register";
import { ethers } from "@nomiclabs/buidler";
import { BigNumber } from "ethers/utils";

import {
  BuidlerRuntimeEnvironment,
  DeployFunction,
} from "@nomiclabs/buidler/types";

import { } from "@utils/constants";
import {
  ensureOutputsFile,
  findDependency,
  getContractAddress,
  getNetworkConstant,
  removeNetwork,
  writeContractAndTransactionToOutputs,
  writeTransactionToOutputs
} from "@utils/deploys/output-helper";
import { ether, getRandomAddress } from "@utils/index";
import { DEPENDENCY } from "@utils/deploys/dependencies"

import { Account, Address } from "@utils/types";

const {
  DFP_MULTI_SIG,
  DPI,
  SINGLE_INDEX_MODULE,
  STREAMING_FEE_MODULE,
  TREASURY_MULTI_SIG,
} = DEPENDENCY;

export const IC_MANAGER = {
  FEE_SPLIT: ether(.7),
}

const func: DeployFunction = async function (bre: BuidlerRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = bre;
  const { deploy, rawTx } = deployments;

  const [ownerWallet] = await ethers.signers();
  const { deployer } = await getNamedAccounts();
  // Configure development deployment
  const networkConstant = await getNetworkConstant();
  try {
    if (networkConstant === "development") {
      console.log(`\n*** Clearing all addresses for ${networkConstant} ***\n`);
      await removeNetwork(networkConstant);
    }
  } catch (error) {
    console.log('*** No addresses to wipe *** ');
  }

  await ensureOutputsFile();

  await polyFillForDevelopment();

  await deployICManager();

  //
  // Helper Functions
  //

  async function polyFillForDevelopment(): Promise<void> {
    if (await findDependency(DPI) === "") {
      await writeContractAndTransactionToOutputs("DPI", await getRandomAddress(), "0x", "Created Mock DPI");
    }

    if (await findDependency(SINGLE_INDEX_MODULE) === "") {
      await writeContractAndTransactionToOutputs("SINGLE_INDEX_MODULE", await getRandomAddress(), "0x", "Created Mock SINGLE_INDEX_MODULE");
    }

    if (await findDependency(STREAMING_FEE_MODULE) === "") {
      await writeContractAndTransactionToOutputs("STREAMING_FEE_MODULE", await getRandomAddress(), "0x", "Created Mock STREAMING_FEE_MODULE");
    }

    console.log("Polyfilled dependencies");
  }

  async function deployICManager(): Promise<void> {
    const checkSingleIndexModuleAddress = await getContractAddress("ICManager");
    if (checkSingleIndexModuleAddress === "") {
      const params: string[] = [
        await findDependency(DPI),
        await findDependency(SINGLE_INDEX_MODULE),
        await findDependency(STREAMING_FEE_MODULE),
        await findDependency(TREASURY_MULTI_SIG),
        await findDependency(DFP_MULTI_SIG),
        IC_MANAGER.FEE_SPLIT
      ];
      const indexDeploy = await deploy("ICManager", { from: deployer, args: params, log: true });
      await writeContractAndTransactionToOutputs("ICManager", indexDeploy.address, indexDeploy.receipt.transactionHash, "Deployed ICManager");
    }
  }
}
export default func;