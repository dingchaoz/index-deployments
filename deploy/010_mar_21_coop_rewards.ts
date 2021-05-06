import "module-alias/register";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import {
  ensureOutputsFile,
  getContractAddress,
  getCurrentStage,
  getNetworkConstant,
  removeNetwork,
  saveContractDeployment,
  stageAlreadyFinished,
  trackFinishedStage,
} from "@deployments/utils";
import {
  CONTRACT_NAMES,
  MERKLE_ROOT_OBJECT,
} from "@deployments/constants/010_mar_21_coop_rewards";

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

  // Fetch INDEX token
  const indexTokenAddress = await getContractAddress(CONTRACT_NAMES.INDEX_TOKEN);

  // Deploy Merkle Distributor contract
  const checkMerkleDistributorAddress = await getContractAddress(CONTRACT_NAMES.REWARDS_MAR21_MERKLE_DISTRIBUTOR);
  if (checkMerkleDistributorAddress === "") {
    const constructorArgs = [indexTokenAddress, MERKLE_ROOT_OBJECT.merkleRoot];
    const merkleDistributorDeploy = await deploy(
      CONTRACT_NAMES.MERKLE_DISTRIBUTOR,
      { from: deployer, args: constructorArgs, log: true }
    );
    merkleDistributorDeploy.receipt &&
      await saveContractDeployment({
        name: CONTRACT_NAMES.REWARDS_MAR21_MERKLE_DISTRIBUTOR,
        contractAddress: merkleDistributorDeploy.address,
        id: merkleDistributorDeploy.receipt.transactionHash,
        description: "Deployed RewardsMar21MerkleDistributor",
        constructorArgs,
      });
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;

