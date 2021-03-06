import "module-alias/register";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import {
  ensureOutputsFile,
  getContractAddress,
  getCurrentStage,
  getNetworkConstant,
  removeNetwork,
  writeContractAndTransactionToOutputs,
} from "@deployments/utils/deploys/outputHelper";
import { stageAlreadyFinished, trackFinishedStage } from "@deployments/utils";
import {
  CONTRACT_NAMES,
  MERKLE_ROOT_OBJECT,
} from "@deployments/constants/004_dec_20_coop_rewards";

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

  // Deploy INDEX token
  const checkIndexTokenAddress = await getContractAddress(CONTRACT_NAMES.INDEX_TOKEN);
  if (checkIndexTokenAddress === "") {
    const indexTokenDeploy = await deploy(
      CONTRACT_NAMES.INDEX_TOKEN,
      { from: deployer, args: [deployer], log: true }
    );
    indexTokenDeploy.receipt &&
      await writeContractAndTransactionToOutputs(
        CONTRACT_NAMES.INDEX_TOKEN,
        indexTokenDeploy.address,
        indexTokenDeploy.receipt.transactionHash,
        "Deployed IndexToken"
      );
  }
  const indexTokenAddress = await getContractAddress(CONTRACT_NAMES.INDEX_TOKEN);

  // Deploy Merkle Distributor contract
  const checkMerkleDistributorAddress = await getContractAddress(CONTRACT_NAMES.REWARDS_DEC20_MERKLE_DISTRIBUTOR);
  if (checkMerkleDistributorAddress === "") {
    const merkleDistributorDeploy = await deploy(
      CONTRACT_NAMES.MERKLE_DISTRIBUTOR,
      { from: deployer, args: [indexTokenAddress, MERKLE_ROOT_OBJECT.merkleRoot], log: true }
    );
    merkleDistributorDeploy.receipt &&
      await writeContractAndTransactionToOutputs(
        CONTRACT_NAMES.REWARDS_DEC20_MERKLE_DISTRIBUTOR,
        merkleDistributorDeploy.address,
        merkleDistributorDeploy.receipt.transactionHash,
        "Deployed RewardsDec20MerkleDistributor"
      );
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;

