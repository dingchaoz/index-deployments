import "module-alias/register";
import { ethers } from "@nomiclabs/buidler";
import { BigNumber } from "ethers/utils";

import {
  BuidlerRuntimeEnvironment,
  DeployFunction,
} from "@nomiclabs/buidler/types";

import { ADDRESS_ZERO, ZERO_BYTES, ZERO, MAX_UINT_256, ONE_DAY_IN_SECONDS, ONE_YEAR_IN_SECONDS } from "@utils/constants";
import {
  ensureOutputsFile,
  findDependency,
  getContractAddress,
  getNetworkConstant,
  getCurrentStage,
  getLastDeploymentStage,
  removeNetwork,
  writeContractAndTransactionToOutputs,
  writeTransactionToOutputs,
  getNetworkId
} from "@utils/deploys/output-helper";
import { MERKLE_DISTRIBUTION } from "@utils/deploys/merkleDistribution";
import { ether, parseBalanceMap } from "@utils/index";
import { IndexTokenFactory } from "@setprotocol/index-coop-contracts/dist/typechain/IndexTokenFactory";
import { stageAlreadyFinished, trackFinishedStage } from "@utils/buidler";

import { Account, Address, DistributionFormat } from "@utils/types";

const EMPTY_ARGS: any[] = [];

const distributionArray: DistributionFormat[] = MERKLE_DISTRIBUTION;

const merkleRootObject = parseBalanceMap(distributionArray); // Merkle root object
const uniswapLPRewardAmount = ether(900000); // 900k tokens; 9% supply
const merkleDistributorAmount = ether(100000); // 100k tokens; 1% supply

const treasuryImmediateOwnershipAmount = ether(500000); // 500k tokens; 5% supply

const treasuryIndexMethodologyOwnershipAmount = ether(750000) // 750k tokens; 7.5% supply

// Treasury vesting amounts 47.5%
const treasuryYearOneOwnershipAmount = ether(2375000); // 2.375m tokens; 23.75% supply
const treasuryYearTwoOwnershipAmount = ether(1425000); // 1.425m tokens; 14.25% supply
const treasuryYearThreeOwnershipAmount = ether(950000); // 950k tokens; 9.5% supply

// Set Labs vesting amounts 28%
const setLabsYearOneOwnershipAmount = ether(1400000); // 1.4m tokens; 14% supply
const setLabsYearTwoOwnershipAmount = ether(840000); // 840k tokens; 8.4% supply
const setLabsYearThreeOwnershipAmount = ether(560000); // 560k tokens; 5.6% supply

// DeFi Pulse vesting amounts 2%
const dfpYearOneOwnershipAmount = ether(100000); // 100k tokens; 1% supply
const dfpYearTwoOwnershipAmount = ether(60000); // 60k tokens; 0.6% supply
const dfpYearThreeOwnershipAmount = ether(40000); // 40k tokens; 0.4% supply

// Vesting parameters
const anchorTime = new BigNumber(Math.floor(Date.now() / 1000)).add(60);
const VESTING_TIMES: { [networkId: string]: any } = {
  vestingIndexMethodologyBegin: {
    production: new BigNumber(1607281200),                   // 12/06/2020 @ 7:00pm UTC
    staging: new BigNumber(1607281200),
    development: anchorTime.add(ONE_DAY_IN_SECONDS.mul(60)),
  },
  vestingIndexMethodologyCliff: {
    production: new BigNumber(1607281200),                   // 12/06/2020 @ 7:00pm UTC
    staging: new BigNumber(1607281200),
    development: anchorTime.add(ONE_DAY_IN_SECONDS.mul(60))
  },
  vestingIndexMethodologyEnd: {
    production: new BigNumber(1653937200),                   // 5/30/2022 @ 7:00pm UTC
    staging: new BigNumber(1653937200),
    development: anchorTime.add(ONE_DAY_IN_SECONDS.mul(600))
  },
  vestingYearOneBegin: {
    production: new BigNumber(1602010800),                   // 10/6/2020 Tuesday 12PM PST
    staging: new BigNumber(1602010800),
    development: anchorTime
  },
  vestingYearOneCliff: {
    production: new BigNumber(1602010800),                   // 10/6/2020 Tuesday 12PM PST
    staging: new BigNumber(1602010800),
    development: anchorTime
  },
  vestingYearOneEnd: {
    production: new BigNumber(1633546800),                   // 10/6/2021
    staging: new BigNumber(1633546800),
    development: anchorTime.add(ONE_YEAR_IN_SECONDS)
  },
  vestingYearTwoBegin: {
    production: new BigNumber(1633546800),                   // 10/6/2021
    staging: new BigNumber(1633546800),
    development: anchorTime.add(ONE_YEAR_IN_SECONDS)
  },
  vestingYearTwoCliff: {
    production: new BigNumber(1633546800),                   // 10/6/2021
    staging: new BigNumber(1633546800),
    development: anchorTime.add(ONE_YEAR_IN_SECONDS)
  },
  vestingYearTwoEnd: {
    production: new BigNumber(1665082800),                   // 10/6/2022
    staging: new BigNumber(1665082800),
    development: anchorTime.add(ONE_YEAR_IN_SECONDS.mul(2))
  },
  vestingYearThreeBegin: {
    production: new BigNumber(1665082800),                   // 10/6/2022
    staging: new BigNumber(1665082800),
    development: anchorTime.add(ONE_YEAR_IN_SECONDS.mul(2))
  },
  vestingYearThreeCliff: {
    production: new BigNumber(1665082800),                   // 10/6/2022
    staging: new BigNumber(1665082800),
    development: anchorTime.add(ONE_YEAR_IN_SECONDS.mul(2))
  },
  vestingYearThreeEnd: {
    production: new BigNumber(1696618800),                   // 10/6/2023
    staging: new BigNumber(1696618800),
    development: anchorTime.add(ONE_YEAR_IN_SECONDS.mul(3))
  },
}

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

  // Retrieve dependencies
  let uniswapLPReward = await findDependency("DPI_ETH_UNI_POOL");
  if (uniswapLPReward === "") {
    uniswapLPReward = deployer;
  }

  let setLabsAddress;
  if (networkConstant === "production") {
    setLabsAddress = await findDependency("SET_LABS");
  } else {
    setLabsAddress = deployer;
  }

  let treasuryMultisigAddress;
  if (networkConstant === "production") {
    treasuryMultisigAddress = await findDependency("TREASURY_MULTI_SIG");
  } else {
    treasuryMultisigAddress = deployer;
    await writeContractAndTransactionToOutputs("TREASURY_MULTI_SIG", treasuryMultisigAddress, "0x", "Created Mock TREASURY_MULTI_SIG");
  }

  let dfpMultisigAddress;
  if (networkConstant === "production") {
    dfpMultisigAddress = await findDependency("DFP_MULTI_SIG");
  } else {
    dfpMultisigAddress = deployer;
    await writeContractAndTransactionToOutputs("DFP_MULTI_SIG", dfpMultisigAddress, "0x", "Created Mock DFP_MULTI_SIG");
  }

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
  const checkMerkleDistributorAddress = await getContractAddress("MerkleDistributor");
  if (checkMerkleDistributorAddress === "") {
    const merkleDistributorDeploy = await deploy(
      "MerkleDistributor",
      { from: deployer, args: [indexTokenAddress, merkleRootObject.merkleRoot], log: true }
    );
    await writeContractAndTransactionToOutputs("MerkleDistributor", merkleDistributorDeploy.address, merkleDistributorDeploy.receipt.transactionHash, "Deployed MerkleDistributor");
  }
  const merkleDistributorAddress = await getContractAddress("MerkleDistributor");

  // Deploy Uniswap LP staking rewards contract
  const checkStakingRewardsAddress = await getContractAddress("StakingRewards");
  if (checkStakingRewardsAddress === "") {
    const stakingRewardsDeploy = await deploy(
      "StakingRewards",
      { from: deployer, args: [treasuryMultisigAddress, indexTokenAddress, uniswapLPReward], log: true }
    );
    await writeContractAndTransactionToOutputs("StakingRewards", stakingRewardsDeploy.address, stakingRewardsDeploy.receipt.transactionHash, "Deployed StakingRewards");
  }
  const stakingRewardsAddress = await getContractAddress("StakingRewards");

  // Deploy Treasury index methodology vesting contract
  const treasuryIndexMethodologyVestingAddress = await deployVesting(
    "IndexMethodologyTreasuryVesting",
    indexTokenAddress,
    treasuryMultisigAddress,
    treasuryIndexMethodologyOwnershipAmount,
    VESTING_TIMES.vestingIndexMethodologyBegin[networkConstant],
    VESTING_TIMES.vestingIndexMethodologyCliff[networkConstant],
    VESTING_TIMES.vestingIndexMethodologyEnd[networkConstant],
    "Deploy Index Methodology Treasury Vesting"
  );

  // Deploy Treasury 1 year treasury vesting contract
  const treasuryYearOneVestingAddress = await deployVesting(
    "YearOneTreasuryVesting",
    indexTokenAddress,
    treasuryMultisigAddress,
    treasuryYearOneOwnershipAmount,
    VESTING_TIMES.vestingYearOneBegin[networkConstant],
    VESTING_TIMES.vestingYearOneCliff[networkConstant],
    VESTING_TIMES.vestingYearOneEnd[networkConstant],
    "Deploy Treasury 1yr Vesting"
  );

  // Deploy Treasury 2 year treasury vesting contract
  const treasuryYearTwoVestingAddress = await deployVesting(
    "YearTwoTreasuryVesting",
    indexTokenAddress,
    treasuryMultisigAddress,
    treasuryYearTwoOwnershipAmount,
    VESTING_TIMES.vestingYearTwoBegin[networkConstant],
    VESTING_TIMES.vestingYearTwoCliff[networkConstant],
    VESTING_TIMES.vestingYearTwoEnd[networkConstant],
    "Deploy Treasury 2yr Vesting"
  );

  // Deploy Treasury 3 year treasury vesting contract
  const treasuryYearThreeVestingAddress = await deployVesting(
    "YearThreeTreasuryVesting",
    indexTokenAddress,
    treasuryMultisigAddress,
    treasuryYearThreeOwnershipAmount,
    VESTING_TIMES.vestingYearThreeBegin[networkConstant],
    VESTING_TIMES.vestingYearThreeCliff[networkConstant],
    VESTING_TIMES.vestingYearThreeEnd[networkConstant],
    "Deploy Treasury 3yr Vesting"
  );

  // Deploy Set Labs 1 year vesting contract
  const setLabsYearOneVestingAddress = await deployVesting(
    "YearOneSetLabsVesting",
    indexTokenAddress,
    setLabsAddress,
    setLabsYearOneOwnershipAmount,
    VESTING_TIMES.vestingYearOneBegin[networkConstant],
    VESTING_TIMES.vestingYearOneCliff[networkConstant],
    VESTING_TIMES.vestingYearOneEnd[networkConstant],
    "Deploy Set Labs 1yr Vesting"
  );

  // Deploy Set Labs 2 year vesting contract
  const setLabsYearTwoVestingAddress = await deployVesting(
    "YearTwoSetLabsVesting",
    indexTokenAddress,
    setLabsAddress,
    setLabsYearTwoOwnershipAmount,
    VESTING_TIMES.vestingYearTwoBegin[networkConstant],
    VESTING_TIMES.vestingYearTwoCliff[networkConstant],
    VESTING_TIMES.vestingYearTwoEnd[networkConstant],
    "Deploy Set Labs 2yr Vesting"
  );

  // Deploy Set Labs 3 year vesting contract
  const setLabsYearThreeVestingAddress = await deployVesting(
    "YearThreeSetLabsVesting",
    indexTokenAddress,
    setLabsAddress,
    setLabsYearThreeOwnershipAmount,
    VESTING_TIMES.vestingYearThreeBegin[networkConstant],
    VESTING_TIMES.vestingYearThreeCliff[networkConstant],
    VESTING_TIMES.vestingYearThreeEnd[networkConstant],
    "Deploy Set Labs 3yr Vesting"
  );

  // Deploy DFP 1 year vesting contract
  const dfpYearOneVestingAddress = await deployVesting(
    "YearOneDFPVesting",
    indexTokenAddress,
    dfpMultisigAddress,
    dfpYearOneOwnershipAmount,
    VESTING_TIMES.vestingYearOneBegin[networkConstant],
    VESTING_TIMES.vestingYearOneCliff[networkConstant],
    VESTING_TIMES.vestingYearOneEnd[networkConstant],
    "Deploy DFP 1yr Vesting"
  );

  // Deploy DFP 2 year vesting contract
  const dfpYearTwoVestingAddress = await deployVesting(
    "YearTwoDFPVesting",
    indexTokenAddress,
    dfpMultisigAddress,
    dfpYearTwoOwnershipAmount,
    VESTING_TIMES.vestingYearTwoBegin[networkConstant],
    VESTING_TIMES.vestingYearTwoCliff[networkConstant],
    VESTING_TIMES.vestingYearTwoEnd[networkConstant],
    "Deploy DFP 1yr Vesting"
  );

  // Deploy DFP 3 year vesting contract
  const dfpYearThreeVestingAddress = await deployVesting(
    "YearThreeDFPVesting",
    indexTokenAddress,
    dfpMultisigAddress,
    dfpYearThreeOwnershipAmount,
    VESTING_TIMES.vestingYearThreeBegin[networkConstant],
    VESTING_TIMES.vestingYearThreeCliff[networkConstant],
    VESTING_TIMES.vestingYearThreeEnd[networkConstant],
    "Deploy DFP 1yr Vesting"
  );

  // Transfer INDEX tokens

  const indexTokenInstance = await new IndexTokenFactory(ownerWallet).attach(indexTokenAddress);

  await transferIndexTokenFromDeployer(
    treasuryMultisigAddress,
    treasuryImmediateOwnershipAmount,
    "Transferred immediately vested INDEX to Treasury Multisig"
  );

  await transferIndexTokenFromDeployer(
    treasuryIndexMethodologyVestingAddress,
    treasuryIndexMethodologyOwnershipAmount,
    "Transferred INDEX to index methodology vesting contract"
  );

  await transferIndexTokenFromDeployer(
    merkleDistributorAddress,
    merkleDistributorAmount,
    "Transferred INDEX to Merkle Distributor"
  );

  await transferIndexTokenFromDeployer(
    stakingRewardsAddress,
    uniswapLPRewardAmount,
    "Transferred INDEX to Uniswap LP StakingRewards"
  );

  await transferIndexTokenFromDeployer(
    treasuryYearOneVestingAddress,
    treasuryYearOneOwnershipAmount,
    "Transferred INDEX to Treasury 1yr vesting contract"
  );

  await transferIndexTokenFromDeployer(
    treasuryYearTwoVestingAddress,
    treasuryYearTwoOwnershipAmount,
    "Transferred INDEX to Treasury 2yr vesting contract"
  );

  await transferIndexTokenFromDeployer(
    treasuryYearThreeVestingAddress,
    treasuryYearThreeOwnershipAmount,
    "Transferred INDEX to Treasury 3yr vesting contract"
  );

  await transferIndexTokenFromDeployer(
    setLabsYearOneVestingAddress,
    setLabsYearOneOwnershipAmount,
    "Transferred INDEX to Set Labs 1yr vesting contract"
  );

  await transferIndexTokenFromDeployer(
    setLabsYearTwoVestingAddress,
    setLabsYearTwoOwnershipAmount,
    "Transferred INDEX to Set Labs 2yr vesting contract"
  );

  await transferIndexTokenFromDeployer(
    setLabsYearThreeVestingAddress,
    setLabsYearThreeOwnershipAmount,
    "Transferred INDEX to Set Labs 3yr vesting contract"
  );

  await transferIndexTokenFromDeployer(
    dfpYearOneVestingAddress,
    dfpYearOneOwnershipAmount,
    "Transferred INDEX to DFP 1yr vesting contract"
  );

  await transferIndexTokenFromDeployer(
    dfpYearTwoVestingAddress,
    dfpYearTwoOwnershipAmount,
    "Transferred INDEX to DFP 2yr vesting contract"
  );

  await transferIndexTokenFromDeployer(
    dfpYearThreeVestingAddress,
    dfpYearThreeOwnershipAmount,
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
        "Vesting",
        { from: deployer, args: [indexTokenAddress, recipient, vestingAmount, vestingBegin, vestingCliff, vestingEnd], log: true }
      );
      await writeContractAndTransactionToOutputs(contractName, vestingDeploy.address, vestingDeploy.receipt.transactionHash, description);
    }
    return await getContractAddress(contractName);
  }

  async function transferIndexTokenFromDeployer(recipient: Address, quantity: BigNumber, comment: string): Promise<void> {
    const recipientBalance = await indexTokenInstance.balanceOf(recipient);
    if (recipientBalance.eq(0)) {
      const transferData = indexTokenInstance.interface.functions.transfer.encode([
        recipient,
        quantity
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

