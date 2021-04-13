import "module-alias/register";
import { BigNumber } from "@ethersproject/bignumber";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import {
  ensureOutputsFile,
  findDependency,
  getContractAddress,
  getCurrentStage,
  getNetworkConstant,
  removeNetwork,
  writeContractAndTransactionToOutputs,
  saveContractDeployment,
  stageAlreadyFinished,
  trackFinishedStage,
  DEPENDENCY,
  EMPTY_BYTES,
  ONE_DAY_IN_SECONDS,
} from "@deployments/utils";
import { Address } from "@utils/types";
import {
  CONTRACT_NAMES,
} from "@deployments/constants/008_fli_staking_reward";

const {
  ETHFLI_UNI_POOL,
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

  let treasuryMultisigAddress: Address;
  if (networkConstant === "production") {
    treasuryMultisigAddress = await findDependency(TREASURY_MULTI_SIG);
  } else {
    treasuryMultisigAddress = deployer;
    await writeContractAndTransactionToOutputs(TREASURY_MULTI_SIG, treasuryMultisigAddress, EMPTY_BYTES, "Created Mock TREASURY_MULTI_SIG");
  }

  let uniswapLPReward = await findDependency(ETHFLI_UNI_POOL);
  if (uniswapLPReward === "") {
    uniswapLPReward = deployer;
    await writeContractAndTransactionToOutputs(ETHFLI_UNI_POOL, uniswapLPReward, EMPTY_BYTES, "Created Mock ETHFLI_UNI_POOL");
  }

  // Deploy INDEX token
  const checkIndexTokenAddress = await getContractAddress(CONTRACT_NAMES.INDEX_TOKEN);
  if (checkIndexTokenAddress === "") {
    const constructorArgs = [deployer];
    const indexTokenDeploy = await deploy(
      CONTRACT_NAMES.INDEX_TOKEN,
      { from: deployer, args: constructorArgs, log: true }
    );
    indexTokenDeploy.receipt &&
      await saveContractDeployment({
        name: CONTRACT_NAMES.INDEX_TOKEN,
        contractAddress: indexTokenDeploy.address,
        id: indexTokenDeploy.receipt.transactionHash,
        description: "Deployed IndexToken",
        constructorArgs,
      });
  }
  const indexTokenAddress = await getContractAddress(CONTRACT_NAMES.INDEX_TOKEN);

  await deployNewStakingContract(
    CONTRACT_NAMES.STAKING_REWARDS_V2_ETHFLI,
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
        const constructorArgs = [distributor, rewardToken, stakingToken, duration];
        const stakingRewardsDeploy = await deploy(
          CONTRACT_NAMES.STAKING_REWARDS_V2,
          { from: deployer, args: constructorArgs, log: true }
        );
        stakingRewardsDeploy.receipt &&
          await saveContractDeployment({
            name: contractName,
            contractAddress: stakingRewardsDeploy.address,
            id: stakingRewardsDeploy.receipt.transactionHash,
            description: `Deployed ${ contractName }`,
            constructorArgs,
          });
      }
      return await getContractAddress(contractName);
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;