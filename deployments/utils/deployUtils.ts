import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  getLastDeploymentStage,
  writeStateToOutputs,
  ensureOutputsFile
} from "@deployments/utils/deploys/outputHelper";
import { MerkleDistributorInfo } from "../../utils/types";

import {
  getContractAddress,
  saveContractDeployment,
  getNetworkConstant,
  removeNetwork,
} from "@deployments/utils";

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

// Runs at the top of every deploy script, clearing contract addresses when network is development
export async function prepareDeployment(hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, rawTx } = deployments;
  const { deployer } = await getNamedAccounts();

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

  return {
    deploy,
    rawTx,
    deployer,
    networkConstant,
  };
}

// Deploys MerkleDistributor contract
export async function deployMerkleDistributor(
    indexTokenName: string,
    merkleDistributorContractName: string,
    merkleRootObject: MerkleDistributorInfo,
    distributorRewardsContractName: string,
    hre: HardhatRuntimeEnvironment
  ) {
    const { deployments, getNamedAccounts, run } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    // MerkleDistributor has to be compile by itself to Etherscan verify
    await run("set:compile:one", { contractName: merkleDistributorContractName });

    // Fetch INDEX token
    const indexTokenAddress = await getContractAddress(indexTokenName);

    // Deploy Merkle Distributor contract
    const checkMerkleDistributorAddress = await getContractAddress(distributorRewardsContractName);

    if (checkMerkleDistributorAddress === "") {
      const constructorArgs = [indexTokenAddress, merkleRootObject.merkleRoot];
      const merkleDistributorDeploy = await deploy(
        merkleDistributorContractName,
        { from: deployer, args: constructorArgs, log: true }
      );
      merkleDistributorDeploy.receipt &&
        await saveContractDeployment({
          name: distributorRewardsContractName,
          contractAddress: merkleDistributorDeploy.address,
          id: merkleDistributorDeploy.receipt.transactionHash,
          description: `Deployed ${distributorRewardsContractName}`,
          constructorArgs,
        });
    }
  }
