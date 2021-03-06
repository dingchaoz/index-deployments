import "module-alias/register";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import {
  ensureOutputsFile,
  getNetworkConstant,
  removeNetwork,
  getCurrentStage,
  saveContractDeployment,
} from "@deployments/utils/deploys/outputHelper";

import { getRandomAddress } from "@utils/index";

import {
  ContractSettings,
  MethodologySettings,
  ExecutionSettings,
  IncentiveSettings } from "@utils/types";

import { stageAlreadyFinished, trackFinishedStage, EMPTY_BYTES } from "@deployments/utils";

import {
  CONTRACT_NAMES,
  METHODOLOGY_SETTINGS,
  EXECUTION_SETTINGS,
  INCENTIVE_SETTINGS,
} from "@deployments/constants/007_ethfli_system";
import { BigNumber } from "ethers";

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(
  CURRENT_STAGE,
  async function (hre: HardhatRuntimeEnvironment) {

  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Configure development deployment
  const networkConstant = await getNetworkConstant();

  try {
    if (networkConstant === "development") {
      console.log(`\n*** Clearing all addresses for ${networkConstant} ***\n`);
      await removeNetwork(networkConstant);
    } else {
      console.log(
        `\n*** This deployment must run with .env setting: DEPLOYMENT_CONSTANT="development" ***\n`
      );
      process.exit(1);
    }
  } catch (error) {
    console.log("*** No addresses to wipe *** ");
  }

  await ensureOutputsFile();
  await deployFlexibleLeverageStrategyAdapter();

  //
  // Helper Functions
  //
  async function deployFlexibleLeverageStrategyAdapter(): Promise<void> {
    const manager = await getRandomAddress();
    const contractSettings: ContractSettings = {
      setToken: await getRandomAddress(),
      leverageModule: await getRandomAddress(),
      comptroller: await getRandomAddress(),
      targetCollateralCToken: await getRandomAddress(),
      targetBorrowCToken: await getRandomAddress(),
      collateralAsset: await getRandomAddress(),
      borrowAsset: await getRandomAddress(),
      collateralPriceOracle: await getRandomAddress(),
      borrowPriceOracle: await getRandomAddress(),
      collateralDecimalAdjustment: BigNumber.from(10),
      borrowDecimalAdjustment: BigNumber.from(22),
    };
    const methodologySettings: MethodologySettings = METHODOLOGY_SETTINGS;
    const executionSettings: ExecutionSettings = {
      ...EXECUTION_SETTINGS,
      leverExchangeData: EMPTY_BYTES,
      deleverExchangeData: EMPTY_BYTES,
    };
    const incentiveSettings: IncentiveSettings = INCENTIVE_SETTINGS;

    const constructorArgs = [
      manager,
      contractSettings,
      methodologySettings,
      executionSettings,
      incentiveSettings,
    ];

    const flexibleLeverageDeploy = await deploy(
      CONTRACT_NAMES.FLEXIBLE_LEVERAGE_ADAPTER, {
        from: deployer,
        args: constructorArgs,
        log: true,
    });

    flexibleLeverageDeploy.receipt && await saveContractDeployment({
      name: CONTRACT_NAMES.FLEXIBLE_LEVERAGE_ADAPTER,
      contractAddress: flexibleLeverageDeploy.address,
      id: flexibleLeverageDeploy.receipt.transactionHash,
      description: "Deployed FexibleLeverageStrategyAdapter",
      constructorArgs,
    });
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;
