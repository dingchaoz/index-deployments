import "module-alias/register";

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber } from "@ethersproject/bignumber";
import { ether } from "@utils/index";

import { EMPTY_BYTES } from "@deployments/utils/constants";
import {
  ensureOutputsFile,
  findDependency,
  getContractAddress,
  getNetworkConstant,
  removeNetwork,
  getCurrentStage,
  writeTransactionToOutputs,
  writeContractAndTransactionToOutputs,
} from "@deployments/utils/deploys/outputHelper";
import { getAccounts, getRandomAddress } from "@utils/index";
import { Account, LeverageTokenSettings } from "@utils/types";
import { stageAlreadyFinished, trackFinishedStage } from "@deployments/utils";
import { DEPENDENCY } from "@deployments/utils/deploys/dependencies";
import InstanceGetter from "@deployments/utils/instanceGetter";
import {
  CONTRACT_NAMES,
  FLI_STRATEGY_PARAMS,
} from "@deployments/constants/005_ethfli_system";

const {
  C_ETH,
  C_USDC,
  ETHFLI,
  COMPOUND_LEVERAGE_MODULE,
  COMPOUND_COMPTROLLER,
  COMPOUND_PRICE_ORACLE,
  WETH,
  USDC,
} = DEPENDENCY;

let owner: Account;
let instanceGetter: InstanceGetter;

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (bre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = bre;
  const { deploy, rawTx } = deployments;

  [owner] = await getAccounts();
  instanceGetter = new InstanceGetter(owner.wallet);

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

  await polyFillForDevelopment();

  await deployICManagerV2();

  await deployFlexibleLeverageStrategyAdapter();

  await addAdapter(CONTRACT_NAMES.IC_MANAGER_V2, CONTRACT_NAMES.FLEXIBLE_LEVERAGE_ADAPTER);

  //
  // Helper Functions
  //

  async function polyFillForDevelopment(): Promise<void> {
    if (await findDependency(ETHFLI) === "") {
      await writeContractAndTransactionToOutputs(ETHFLI, await getRandomAddress(), EMPTY_BYTES, "Created Mock ETHFLI");
    }

    if (await findDependency(COMPOUND_LEVERAGE_MODULE) === "") {
      await writeContractAndTransactionToOutputs(COMPOUND_LEVERAGE_MODULE, await getRandomAddress(), EMPTY_BYTES, "Created Mock COMPOUND_LEVERAGE_MODULE");
    }

    if (await findDependency(COMPOUND_COMPTROLLER) === "") {
      await writeContractAndTransactionToOutputs(COMPOUND_COMPTROLLER, await getRandomAddress(), EMPTY_BYTES, "Created Mock COMPOUND_COMPTROLLER");
    }

    if (await findDependency(COMPOUND_PRICE_ORACLE) === "") {
      await writeContractAndTransactionToOutputs(COMPOUND_PRICE_ORACLE, await getRandomAddress(), EMPTY_BYTES, "Created Mock COMPOUND_PRICE_ORACLE");
    }

    if (await findDependency(WETH) === "") {
      const token = await deploy(
        CONTRACT_NAMES.STANDARD_TOKEN_MOCK,
        { from: deployer, args: [deployer, ether(1000000000), WETH, WETH, BigNumber.from(18)], log: true }
      );
      token.receipt &&
        await writeContractAndTransactionToOutputs(WETH, token.address, token.receipt.transactionHash, "Created Mock WETH");
    }

    if (await findDependency(USDC) === "") {
      const token = await deploy(
        CONTRACT_NAMES.STANDARD_TOKEN_MOCK,
        { from: deployer, args: [deployer, ether(1000000000), USDC, USDC, BigNumber.from(6)], log: true }
      );
      token.receipt &&
        await writeContractAndTransactionToOutputs(USDC, token.address, token.receipt.transactionHash, "Created Mock USDC");
    }

    if (await findDependency(C_ETH) === "") {
      const token = await deploy(
        CONTRACT_NAMES.STANDARD_TOKEN_MOCK,
        { from: deployer, args: [deployer, ether(1000000000), C_ETH, C_ETH, BigNumber.from(8)], log: true }
      );
      token.receipt &&
        await writeContractAndTransactionToOutputs(C_ETH, token.address, token.receipt.transactionHash, "Created Mock C_ETH");
    }

    if (await findDependency(C_USDC) === "") {
      const token = await deploy(
        CONTRACT_NAMES.STANDARD_TOKEN_MOCK,
        { from: deployer, args: [deployer, ether(1000000000), C_USDC, C_USDC, BigNumber.from(8)], log: true }
      );
      token.receipt &&
        await writeContractAndTransactionToOutputs(C_USDC, token.address, token.receipt.transactionHash, "Created Mock C_USDC");
    }

    console.log("Polyfilled dependencies");
  }

  async function deployICManagerV2(): Promise<void> {
    const checkICManagerV2Address = await getContractAddress(CONTRACT_NAMES.IC_MANAGER_V2);
    if (checkICManagerV2Address === "") {
      const params: string[] = [
        await findDependency(ETHFLI),
        deployer, // Set operator to deployer for now
        deployer, // Set methodology to deployer for now
        [],
      ];
      const icManagerV2Deploy = await deploy(CONTRACT_NAMES.IC_MANAGER_V2, { from: deployer, args: params, log: true });
      icManagerV2Deploy.receipt && await writeContractAndTransactionToOutputs(
        CONTRACT_NAMES.IC_MANAGER_V2,
        icManagerV2Deploy.address,
        icManagerV2Deploy.receipt.transactionHash,
        "Deployed ICManagerV2"
      );
    }
  }

  async function deployFlexibleLeverageStrategyAdapter(): Promise<void> {
    const checkFlexibleLeverageAdapterAddress = await getContractAddress(CONTRACT_NAMES.FLEXIBLE_LEVERAGE_ADAPTER);
    if (checkFlexibleLeverageAdapterAddress === "") {
      const ethFliSettings: LeverageTokenSettings = {
        setToken: await findDependency(ETHFLI),
        leverageModule: await findDependency(COMPOUND_LEVERAGE_MODULE),
        manager: await getContractAddress(CONTRACT_NAMES.IC_MANAGER_V2),
        comptroller: await findDependency(COMPOUND_COMPTROLLER),
        priceOracle: await findDependency(COMPOUND_PRICE_ORACLE),
        targetCollateralCToken: await findDependency(C_ETH),
        targetBorrowCToken: await findDependency(C_USDC),
        collateralAsset: await findDependency(WETH),
        borrowAsset: await findDependency(USDC),
        ...FLI_STRATEGY_PARAMS,
      };

      const flexibleLeverageDeploy = await deploy(CONTRACT_NAMES.FLEXIBLE_LEVERAGE_ADAPTER, { from: deployer, args: [ethFliSettings], log: true });
      flexibleLeverageDeploy.receipt && await writeContractAndTransactionToOutputs(
        CONTRACT_NAMES.FLEXIBLE_LEVERAGE_ADAPTER,
        flexibleLeverageDeploy.address,
        flexibleLeverageDeploy.receipt.transactionHash,
        "Deployed FlexibleLeverageStrategyAdapter"
      );
    }
  }

  async function addAdapter(icManagerName: string, adapterName: string): Promise<void> {
    const icManagerAddress = await getContractAddress(icManagerName);
    const icManagerInstance = await instanceGetter.getICManagerV2(icManagerAddress);

    const adapterAddress = await getContractAddress(adapterName);
    if (!await icManagerInstance.isAdapter(adapterAddress)) {
      const adapterData = icManagerInstance.interface.encodeFunctionData("addAdapter", [adapterAddress]);
      const addAdapterTransaction: any = await rawTx({
        from: deployer,
        to: icManagerInstance.address,
        data: adapterData,
        log: true,
      });
      await writeTransactionToOutputs(addAdapterTransaction.transactionHash, `Add ${adapterName} to ICManagerV2`);
    }
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;