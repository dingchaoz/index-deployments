import "module-alias/register";
import { ethers } from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import {
  ensureOutputsFile,
  findDependency,
  getContractAddress,
  getNetworkConstant,
  getCurrentStage,
  removeNetwork,
  writeContractAndTransactionToOutputs,
  writeTransactionToOutputs,
} from "@deployments/utils/deploys/outputHelper";

import { IndexTokenFactory } from "@setprotocol/index-coop-contracts/dist/typechain/IndexTokenFactory";
import { stageAlreadyFinished, trackFinishedStage } from "@deployments/utils";
import { Address } from "@utils/types";
import { DEPENDENCY } from "@deployments/utils/deploys/dependencies";

import {
  CONTRACT_NAMES,
  VESTING_TIMES,
  MERKLE_ROOT_OBJECT,
  UNISWAP_LP_REWARD_AMOUNT,
  MERKLE_DISTRIBUTOR_AMOUNT,
  TREASURY_IMMEDIATE_OWNERSHIP_AMOUNT,
  TREASURY_INDEX_METHODOLOGY_OWNERSHIP_AMOUNT,
  TREASURY_YEAR_ONE_OWNERSHIP_AMOUNT,
  TREASURY_YEAR_TWO_OWNERSHIP_AMOUNT,
  TREASURY_YEAR_THREE_OWNERSHIP_AMOUNT,
  SET_LABS_YEAR_ONE_OWNERSHIP_AMOUNT,
  SET_LABS_YEAR_TWO_OWNERSHIP_AMOUNT,
  SET_LABS_YEAR_THREE_OWNERSHIP_AMOUNT,
  DFP_YEAR_ONE_OWNERSHIP_AMOUNT,
  DFP_YEAR_TWO_OWNERSHIP_AMOUNT,
  DFP_YEAR_THREE_OWNERSHIP_AMOUNT,
} from "@deployments/constants/000_base_system";
import { EMPTY_BYTES } from "@deployments/utils/constants";

const {
  TREASURY_MULTI_SIG,
  DFP_MULTI_SIG,
  SET_LABS,
  DPI_ETH_UNI_POOL,
} = DEPENDENCY;

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (bre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = bre;
  const { deploy, rawTx } = deployments;

  const [ownerWallet] = await ethers.getSigners();
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

  console.log(JSON.stringify(MERKLE_ROOT_OBJECT.claims));

  // Retrieve dependencies
  let uniswapLPReward = await findDependency(DPI_ETH_UNI_POOL);
  if (uniswapLPReward === "") {
    uniswapLPReward = deployer;
  }

  let setLabsAddress;
  if (networkConstant === "production") {
    setLabsAddress = await findDependency(SET_LABS);
  } else {
    setLabsAddress = deployer;
  }

  let treasuryMultisigAddress;
  if (networkConstant === "production") {
    treasuryMultisigAddress = await findDependency(TREASURY_MULTI_SIG);
  } else {
    treasuryMultisigAddress = deployer;
    await writeContractAndTransactionToOutputs(TREASURY_MULTI_SIG, treasuryMultisigAddress, EMPTY_BYTES, "Created Mock TREASURY_MULTI_SIG");
  }

  let dfpMultisigAddress;
  if (networkConstant === "production") {
    dfpMultisigAddress = await findDependency(DFP_MULTI_SIG);
  } else {
    dfpMultisigAddress = deployer;
    await writeContractAndTransactionToOutputs(DFP_MULTI_SIG, dfpMultisigAddress, EMPTY_BYTES, "Created Mock DFP_MULTI_SIG");
  }

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
  const checkMerkleDistributorAddress = await getContractAddress(CONTRACT_NAMES.MERKLE_DISTRIBUTOR);
  if (checkMerkleDistributorAddress === "") {
    const merkleDistributorDeploy = await deploy(
      CONTRACT_NAMES.MERKLE_DISTRIBUTOR,
      { from: deployer, args: [indexTokenAddress, MERKLE_ROOT_OBJECT.merkleRoot], log: true }
    );
    merkleDistributorDeploy.receipt &&
      await writeContractAndTransactionToOutputs(
        CONTRACT_NAMES.MERKLE_DISTRIBUTOR,
        merkleDistributorDeploy.address,
        merkleDistributorDeploy.receipt.transactionHash,
        "Deployed MerkleDistributor"
      );
  }
  const merkleDistributorAddress = await getContractAddress(CONTRACT_NAMES.MERKLE_DISTRIBUTOR);

  // Deploy Uniswap LP staking rewards contract
  const checkStakingRewardsAddress = await getContractAddress(CONTRACT_NAMES.STAKING_REWARDS);
  if (checkStakingRewardsAddress === "") {
    const stakingRewardsDeploy = await deploy(
      CONTRACT_NAMES.STAKING_REWARDS,
      { from: deployer, args: [treasuryMultisigAddress, indexTokenAddress, uniswapLPReward], log: true }
    );
    stakingRewardsDeploy.receipt &&
      await writeContractAndTransactionToOutputs(
        CONTRACT_NAMES.STAKING_REWARDS,
        stakingRewardsDeploy.address,
        stakingRewardsDeploy.receipt.transactionHash,
        "Deployed StakingRewards"
      );
  }
  const stakingRewardsAddress = await getContractAddress(CONTRACT_NAMES.STAKING_REWARDS);

  // Deploy Treasury index methodology vesting contract
  const treasuryIndexMethodologyVestingAddress = await deployVesting(
    CONTRACT_NAMES.INDEX_METHODOLOGY_TREASURY_VESTING,
    indexTokenAddress,
    treasuryMultisigAddress,
    TREASURY_INDEX_METHODOLOGY_OWNERSHIP_AMOUNT,
    VESTING_TIMES.vestingIndexMethodologyBegin[networkConstant],
    VESTING_TIMES.vestingIndexMethodologyCliff[networkConstant],
    VESTING_TIMES.vestingIndexMethodologyEnd[networkConstant],
    "Deploy Index Methodology Treasury Vesting"
  );

  // Deploy Treasury 1 year treasury vesting contract
  const treasuryYearOneVestingAddress = await deployVesting(
    CONTRACT_NAMES.YEAR_ONE_TREASURY_VESTING,
    indexTokenAddress,
    treasuryMultisigAddress,
    TREASURY_YEAR_ONE_OWNERSHIP_AMOUNT,
    VESTING_TIMES.vestingYearOneBegin[networkConstant],
    VESTING_TIMES.vestingYearOneCliff[networkConstant],
    VESTING_TIMES.vestingYearOneEnd[networkConstant],
    "Deploy Treasury 1yr Vesting"
  );

  // Deploy Treasury 2 year treasury vesting contract
  const treasuryYearTwoVestingAddress = await deployVesting(
    CONTRACT_NAMES.YEAR_TWO_TREASURY_VESTING,
    indexTokenAddress,
    treasuryMultisigAddress,
    TREASURY_YEAR_TWO_OWNERSHIP_AMOUNT,
    VESTING_TIMES.vestingYearTwoBegin[networkConstant],
    VESTING_TIMES.vestingYearTwoCliff[networkConstant],
    VESTING_TIMES.vestingYearTwoEnd[networkConstant],
    "Deploy Treasury 2yr Vesting"
  );

  // Deploy Treasury 3 year treasury vesting contract
  const treasuryYearThreeVestingAddress = await deployVesting(
    CONTRACT_NAMES.YEAR_THREE_TREASURY_VESTING,
    indexTokenAddress,
    treasuryMultisigAddress,
    TREASURY_YEAR_THREE_OWNERSHIP_AMOUNT,
    VESTING_TIMES.vestingYearThreeBegin[networkConstant],
    VESTING_TIMES.vestingYearThreeCliff[networkConstant],
    VESTING_TIMES.vestingYearThreeEnd[networkConstant],
    "Deploy Treasury 3yr Vesting"
  );

  // Deploy Set Labs 1 year vesting contract
  const setLabsYearOneVestingAddress = await deployVesting(
    CONTRACT_NAMES.YEAR_ONE_SET_LABS_VESTING,
    indexTokenAddress,
    setLabsAddress,
    SET_LABS_YEAR_ONE_OWNERSHIP_AMOUNT,
    VESTING_TIMES.vestingYearOneBegin[networkConstant],
    VESTING_TIMES.vestingYearOneCliff[networkConstant],
    VESTING_TIMES.vestingYearOneEnd[networkConstant],
    "Deploy Set Labs 1yr Vesting"
  );

  // Deploy Set Labs 2 year vesting contract
  const setLabsYearTwoVestingAddress = await deployVesting(
    CONTRACT_NAMES.YEAR_TWO_SET_LABS_VESTING,
    indexTokenAddress,
    setLabsAddress,
    SET_LABS_YEAR_TWO_OWNERSHIP_AMOUNT,
    VESTING_TIMES.vestingYearTwoBegin[networkConstant],
    VESTING_TIMES.vestingYearTwoCliff[networkConstant],
    VESTING_TIMES.vestingYearTwoEnd[networkConstant],
    "Deploy Set Labs 2yr Vesting"
  );

  // Deploy Set Labs 3 year vesting contract
  const setLabsYearThreeVestingAddress = await deployVesting(
    CONTRACT_NAMES.YEAR_THREE_SET_LABS_VESTING,
    indexTokenAddress,
    setLabsAddress,
    SET_LABS_YEAR_THREE_OWNERSHIP_AMOUNT,
    VESTING_TIMES.vestingYearThreeBegin[networkConstant],
    VESTING_TIMES.vestingYearThreeCliff[networkConstant],
    VESTING_TIMES.vestingYearThreeEnd[networkConstant],
    "Deploy Set Labs 3yr Vesting"
  );

  // Deploy DFP 1 year vesting contract
  const dfpYearOneVestingAddress = await deployVesting(
    CONTRACT_NAMES.YEAR_ONE_DFP_VESTING,
    indexTokenAddress,
    dfpMultisigAddress,
    DFP_YEAR_ONE_OWNERSHIP_AMOUNT,
    VESTING_TIMES.vestingYearOneBegin[networkConstant],
    VESTING_TIMES.vestingYearOneCliff[networkConstant],
    VESTING_TIMES.vestingYearOneEnd[networkConstant],
    "Deploy DFP 1yr Vesting"
  );

  // Deploy DFP 2 year vesting contract
  const dfpYearTwoVestingAddress = await deployVesting(
    CONTRACT_NAMES.YEAR_TWO_DFP_VESTING,
    indexTokenAddress,
    dfpMultisigAddress,
    DFP_YEAR_TWO_OWNERSHIP_AMOUNT,
    VESTING_TIMES.vestingYearTwoBegin[networkConstant],
    VESTING_TIMES.vestingYearTwoCliff[networkConstant],
    VESTING_TIMES.vestingYearTwoEnd[networkConstant],
    "Deploy DFP 1yr Vesting"
  );

  // Deploy DFP 3 year vesting contract
  const dfpYearThreeVestingAddress = await deployVesting(
    CONTRACT_NAMES.YEAR_THREE_DFP_VESTING,
    indexTokenAddress,
    dfpMultisigAddress,
    DFP_YEAR_THREE_OWNERSHIP_AMOUNT,
    VESTING_TIMES.vestingYearThreeBegin[networkConstant],
    VESTING_TIMES.vestingYearThreeCliff[networkConstant],
    VESTING_TIMES.vestingYearThreeEnd[networkConstant],
    "Deploy DFP 1yr Vesting"
  );

  // Transfer INDEX tokens

  const indexTokenInstance = await new IndexTokenFactory(ownerWallet).attach(indexTokenAddress);

  await transferIndexTokenFromDeployer(
    treasuryMultisigAddress,
    TREASURY_IMMEDIATE_OWNERSHIP_AMOUNT,
    "Transferred immediately vested INDEX to Treasury Multisig"
  );

  await transferIndexTokenFromDeployer(
    treasuryIndexMethodologyVestingAddress,
    TREASURY_INDEX_METHODOLOGY_OWNERSHIP_AMOUNT,
    "Transferred INDEX to index methodology vesting contract"
  );

  await transferIndexTokenFromDeployer(
    merkleDistributorAddress,
    MERKLE_DISTRIBUTOR_AMOUNT,
    "Transferred INDEX to Merkle Distributor"
  );

  await transferIndexTokenFromDeployer(
    stakingRewardsAddress,
    UNISWAP_LP_REWARD_AMOUNT,
    "Transferred INDEX to Uniswap LP StakingRewards"
  );

  await transferIndexTokenFromDeployer(
    treasuryYearOneVestingAddress,
    TREASURY_YEAR_ONE_OWNERSHIP_AMOUNT,
    "Transferred INDEX to Treasury 1yr vesting contract"
  );

  await transferIndexTokenFromDeployer(
    treasuryYearTwoVestingAddress,
    TREASURY_YEAR_TWO_OWNERSHIP_AMOUNT,
    "Transferred INDEX to Treasury 2yr vesting contract"
  );

  await transferIndexTokenFromDeployer(
    treasuryYearThreeVestingAddress,
    TREASURY_YEAR_THREE_OWNERSHIP_AMOUNT,
    "Transferred INDEX to Treasury 3yr vesting contract"
  );

  await transferIndexTokenFromDeployer(
    setLabsYearOneVestingAddress,
    SET_LABS_YEAR_ONE_OWNERSHIP_AMOUNT,
    "Transferred INDEX to Set Labs 1yr vesting contract"
  );

  await transferIndexTokenFromDeployer(
    setLabsYearTwoVestingAddress,
    SET_LABS_YEAR_TWO_OWNERSHIP_AMOUNT,
    "Transferred INDEX to Set Labs 2yr vesting contract"
  );

  await transferIndexTokenFromDeployer(
    setLabsYearThreeVestingAddress,
    SET_LABS_YEAR_THREE_OWNERSHIP_AMOUNT,
    "Transferred INDEX to Set Labs 3yr vesting contract"
  );

  await transferIndexTokenFromDeployer(
    dfpYearOneVestingAddress,
    DFP_YEAR_ONE_OWNERSHIP_AMOUNT,
    "Transferred INDEX to DFP 1yr vesting contract"
  );

  await transferIndexTokenFromDeployer(
    dfpYearTwoVestingAddress,
    DFP_YEAR_TWO_OWNERSHIP_AMOUNT,
    "Transferred INDEX to DFP 2yr vesting contract"
  );

  await transferIndexTokenFromDeployer(
    dfpYearThreeVestingAddress,
    DFP_YEAR_THREE_OWNERSHIP_AMOUNT,
    "Transferred INDEX to DFP 3yr vesting contract"
  );

  async function deployVesting(
    contractName: string,
    token: Address,
    recipient: Address,
    vestingAmount: BigNumber,
    vestingBegin: BigNumber,
    vestingCliff: BigNumber,
    vestingEnd: BigNumber,
    description: string,
  ): Promise<Address> {
    const checkVestingAddress = await getContractAddress(contractName);
    if (checkVestingAddress === "") {
      const vestingDeploy = await deploy(
        CONTRACT_NAMES.VESTING,
        { from: deployer, args: [indexTokenAddress, recipient, vestingAmount, vestingBegin, vestingCliff, vestingEnd], log: true }
      );
      vestingDeploy.receipt &&
        await writeContractAndTransactionToOutputs(
          contractName,
          vestingDeploy.address,
          vestingDeploy.receipt.transactionHash,
          description
        );
    }
    return await getContractAddress(contractName);
  }

  async function transferIndexTokenFromDeployer(recipient: Address, quantity: BigNumber, comment: string): Promise<void> {
    const recipientBalance = await indexTokenInstance.balanceOf(recipient);
    if (recipientBalance.eq(0)) {
      const transferData = indexTokenInstance.interface.functions.transfer.encode([
        recipient,
        quantity,
      ]);
      const transferToDFPHash: any = await rawTx({
        from: deployer,
        to: indexTokenInstance.address,
        data: transferData,
        log: true,
      });
      await writeTransactionToOutputs(transferToDFPHash.transactionHash, comment);
    }
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;

