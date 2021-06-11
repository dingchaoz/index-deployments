import "module-alias/register";

import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import {
  prepareDeployment,
  getCurrentStage,
  stageAlreadyFinished,
  trackFinishedStage,
  getContractAddress,
  saveContractDeployment,
  findDependency,
  getNetworkConstant,
  DEPENDENCY,
  EMPTY_BYTES,
  writeContractAndTransactionToOutputs
} from "@deployments/utils";

import {
  CONTRACT_NAMES,
  MASTERCHEF_POOL_ID,
  VESTING_CONTRACTS
} from "@deployments/constants/016_index_powah";
import { getRandomAddress } from "@utils/accountUtils";

const {
  OPS_MULTI_SIG,
  MASTERCHEF,
  INDEX_ETH_UNISWAP,
  INDEX_ETH_SUSHISWAP,
} = DEPENDENCY;

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (hre: HRE) {

  await polyFillForDevelopment();

  const { deploy, deployer } = await prepareDeployment(hre);

  const indexTokenAddress = await getContractAddress(CONTRACT_NAMES.INDEX_TOKEN);
  const indexGov = getNetworkConstant() === "production" ? await findDependency(OPS_MULTI_SIG) : deployer;
  const dpiFarm = await findDependency("StakingRewardsV2 - December");
  const mviFarm = await findDependency("StakingRewardsV2 - MVI");
  const uniPair = await findDependency(INDEX_ETH_UNISWAP);
  const sushiPair = await findDependency(INDEX_ETH_SUSHISWAP);
  const masterChef = await findDependency(MASTERCHEF);

  const checkIndexPowahAddress = await getContractAddress(CONTRACT_NAMES.INDEX_POWAH);
  if (checkIndexPowahAddress === "") {

    const constructorArgs: any[] = [
      indexGov,
      indexTokenAddress,
      uniPair,
      sushiPair,
      masterChef,
      MASTERCHEF_POOL_ID,
      [ dpiFarm, mviFarm ],
      VESTING_CONTRACTS,
    ];
    const indexPowah = await deploy(
      CONTRACT_NAMES.INDEX_POWAH,
      { from: deployer, args: constructorArgs, log: true }
    );

    indexPowah.receipt &&
      await saveContractDeployment({
        name: CONTRACT_NAMES.INDEX_POWAH,
        contractAddress: indexPowah.address,
        id: indexPowah.receipt.transactionHash,
        description: `Deployed ${CONTRACT_NAMES.INDEX_POWAH}`,
        constructorArgs,
      });
  }


  async function polyFillForDevelopment(): Promise<void> {
    if (await findDependency(MASTERCHEF) === "") {
      await writeContractAndTransactionToOutputs(MASTERCHEF, await getRandomAddress(), EMPTY_BYTES, "Created Mock MASTERCHEF");
    }
    if (await findDependency(INDEX_ETH_UNISWAP) === "") {
      await writeContractAndTransactionToOutputs(INDEX_ETH_UNISWAP, await getRandomAddress(), EMPTY_BYTES, "Created Mock INDEX_ETH_UNISWAP");
    }
    if (await findDependency(INDEX_ETH_SUSHISWAP) === "") {
      await writeContractAndTransactionToOutputs(INDEX_ETH_SUSHISWAP, await getRandomAddress(), EMPTY_BYTES, "Created Mock INDEX_ETH_SUSHISWAP");
    }
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;