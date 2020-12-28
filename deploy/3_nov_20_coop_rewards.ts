import "module-alias/register";
import { ethers } from "@nomiclabs/buidler";
import { BigNumber } from "ethers/utils";

import {
  BuidlerRuntimeEnvironment,
  DeployFunction,
} from "@nomiclabs/buidler/types";

import {
  ensureOutputsFile,
  getContractAddress,
  getCurrentStage,
  getNetworkConstant,
  removeNetwork,
  writeContractAndTransactionToOutputs,
} from "@utils/deploys/output-helper";
import { NOVEMBER_MERKLE_DISTRIBUTION } from "@utils/deploys/rewards/nov20Distribution";
import { ether, parseBalanceMap } from "@utils/index";
import { stageAlreadyFinished, trackFinishedStage } from "@utils/buidler";

import { DistributionFormat } from "@utils/types";

const distributionArray: DistributionFormat[] = NOVEMBER_MERKLE_DISTRIBUTION;

const merkleRootObject = parseBalanceMap(distributionArray); // Merkle root object

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (bre: BuidlerRuntimeEnvironment) {
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

  console.log(JSON.stringify(merkleRootObject.claims));

  // Deploy INDEX token
  const checkIndexTokenAddress = await getContractAddress("IndexToken");
  if (checkIndexTokenAddress === "") {
    const indexTokenDeploy = await deploy(
      "IndexToken",
      { from: deployer, args: [deployer], log: true }
    );
    await writeContractAndTransactionToOutputs("IndexToken", indexTokenDeploy.address, indexTokenDeploy.receipt.transactionHash, "Deployed IndexToken");
  }
  const indexTokenAddress = await getContractAddress("IndexToken");

  // Deploy Merkle Distributor contract
  const checkMerkleDistributorAddress = await getContractAddress("RewardsNov20MerkleDistributor");
  if (checkMerkleDistributorAddress === "") {
    const merkleDistributorDeploy = await deploy(
      "MerkleDistributor",
      { from: deployer, args: [indexTokenAddress, merkleRootObject.merkleRoot], log: true }
    );
    await writeContractAndTransactionToOutputs("RewardsNov20MerkleDistributor", merkleDistributorDeploy.address, merkleDistributorDeploy.receipt.transactionHash, "Deployed RewardsNov20MerkleDistributor");
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;

