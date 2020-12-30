import "module-alias/register";
import { BigNumber } from "ethers/utils";

import {
  BuidlerRuntimeEnvironment,
  DeployFunction,
} from "@nomiclabs/buidler/types";

import { EMPTY_BYTES, ONE_DAY_IN_SECONDS } from "@deployments/utils/constants";
import {
  ensureOutputsFile,
  findDependency,
  getContractAddress,
  getCurrentStage,
  getNetworkConstant,
  removeNetwork,
  writeContractAndTransactionToOutputs,
} from "@deployments/utils/deploys/outputHelper";
import { stageAlreadyFinished, trackFinishedStage } from "@deployments/utils";
import { Address } from "@utils/types";
import { DEPENDENCY } from "@deployments/utils/deploys/dependencies";
import {
  CONTRACT_NAMES,
} from "@deployments/constants/002_lm_extension";

const {
  DPI_ETH_UNI_POOL,
  TREASURY_MULTI_SIG,
} = DEPENDENCY;

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (bre: BuidlerRuntimeEnvironment) {
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

  let treasuryMultisigAddress: Address;
  if (networkConstant === "production") {
    treasuryMultisigAddress = await findDependency(TREASURY_MULTI_SIG);
  } else {
    treasuryMultisigAddress = deployer;
    await writeContractAndTransactionToOutputs(TREASURY_MULTI_SIG, treasuryMultisigAddress, EMPTY_BYTES, "Created Mock TREASURY_MULTI_SIG");
  }

  let uniswapLPReward = await findDependency(DPI_ETH_UNI_POOL);
  if (uniswapLPReward === "") {
    uniswapLPReward = deployer;
    await writeContractAndTransactionToOutputs(DPI_ETH_UNI_POOL, uniswapLPReward, EMPTY_BYTES, "Created Mock DPI_ETH_UNI_POOL");
  }

  // Deploy INDEX token
  const checkIndexTokenAddress = await getContractAddress(CONTRACT_NAMES.INDEX_TOKEN);
  if (checkIndexTokenAddress === "") {
    const indexTokenDeploy = await deploy(
      CONTRACT_NAMES.INDEX_TOKEN,
      { from: deployer, args: [deployer], log: true }
    );
    await writeContractAndTransactionToOutputs(
      CONTRACT_NAMES.INDEX_TOKEN,
      indexTokenDeploy.address,
      indexTokenDeploy.receipt.transactionHash,
      "Deployed IndexToken"
    );
  }
  const indexTokenAddress = await getContractAddress(CONTRACT_NAMES.INDEX_TOKEN);

  await deployNewStakingContract(
    CONTRACT_NAMES.STAKING_REWARDS_V2_DECEMBER,
    treasuryMultisigAddress,
    indexTokenAddress,
    uniswapLPReward,
    ONE_DAY_IN_SECONDS.mul(30)
  );

  async function deployNewStakingContract(
    contractName: string,
    distributor: Address,
    rewardToken: Address,
    stakingToken: Address,
    duration: BigNumber
  ): Promise<Address> {
      // Deploy Uniswap LP staking rewards contract
      const checkStakingRewardsAddress = await getContractAddress(contractName);
      if (checkStakingRewardsAddress === "") {
        const stakingRewardsDeploy = await deploy(
          CONTRACT_NAMES.STAKING_REWARDS_V2,
          { from: deployer, args: [distributor, rewardToken, stakingToken, duration], log: true }
        );
        await writeContractAndTransactionToOutputs(contractName, stakingRewardsDeploy.address, stakingRewardsDeploy.receipt.transactionHash, `Deployed ${ contractName }`);
      }
      return await getContractAddress(contractName);
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;