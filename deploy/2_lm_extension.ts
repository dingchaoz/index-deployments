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
  removeNetwork,
  writeContractAndTransactionToOutputs,
  writeTransactionToOutputs,
  getNetworkId
} from "@utils/deploys/output-helper";

import { Account, Address, DistributionFormat } from "@utils/types";

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

  let treasuryMultisigAddress: Address;
  if (networkConstant === "production") {
    treasuryMultisigAddress = await findDependency("TREASURY_MULTI_SIG");
  } else {
    treasuryMultisigAddress = deployer;
    await writeContractAndTransactionToOutputs("TREASURY_MULTI_SIG", treasuryMultisigAddress, "0x", "Created Mock TREASURY_MULTI_SIG");
  }

  let uniswapLPReward = await findDependency("DPI_ETH_UNI_POOL");
  if (uniswapLPReward === "") {
    uniswapLPReward = deployer;
    await writeContractAndTransactionToOutputs("DPI_ETH_UNI_POOL", uniswapLPReward, "0x", "Created Mock DPI_ETH_UNI_POOL");
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

  await deployNewStakingContract("StakingRewardsV2 - December", treasuryMultisigAddress, indexTokenAddress, uniswapLPReward, ONE_DAY_IN_SECONDS.mul(30))

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
          "StakingRewardsV2",
          { from: deployer, args: [distributor, rewardToken, stakingToken, duration], log: true }
        );
        await writeContractAndTransactionToOutputs(contractName, stakingRewardsDeploy.address, stakingRewardsDeploy.receipt.transactionHash, `Deployed ${ contractName }`);
      }
      return await getContractAddress(contractName);
  }
}

export default func;