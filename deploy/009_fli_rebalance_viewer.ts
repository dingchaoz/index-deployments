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
  stageAlreadyFinished,
  trackFinishedStage,
  DEPENDENCY,
  EMPTY_BYTES,
} from "@deployments/utils";
import { ether, getRandomAddress } from "@utils/index";
import {
  CONTRACT_NAMES,
} from "@deployments/constants/009_fli_rebalance_viewer";

const {
  UNISWAP_V2_ROUTER,
  C_ETH,
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

  await polyFillForDevelopment();

  await deployFLIRebalanceViewer();

  //
  // Helper Functions
  //

  async function polyFillForDevelopment(): Promise<void> {
    if (await findDependency(C_ETH) === "") {
      const token = await deploy(
        CONTRACT_NAMES.STANDARD_TOKEN_MOCK,
        { from: deployer, args: [deployer, ether(1000000000), C_ETH, C_ETH, BigNumber.from(8)], log: true }
      );
      token.receipt &&
        await writeContractAndTransactionToOutputs(C_ETH, token.address, token.receipt.transactionHash, "Created Mock C_ETH");
    }

    if (await findDependency(UNISWAP_V2_ROUTER) === "") {
      await writeContractAndTransactionToOutputs(UNISWAP_V2_ROUTER, await getRandomAddress(), EMPTY_BYTES, "Created Mock UNISWAP_V2_ROUTER");
    }

    if (await findDependency(CONTRACT_NAMES.FLEXIBLE_LEVERAGE_ADAPTER) === "") {
      await writeContractAndTransactionToOutputs(CONTRACT_NAMES.FLEXIBLE_LEVERAGE_ADAPTER, await getRandomAddress(), EMPTY_BYTES, "Created Mock FLEXIBLE_LEVERAGE_ADAPTER");
    }
  }

  async function deployFLIRebalanceViewer(): Promise<void> {
    const checkFLIRebalanceViewerAddress = await getContractAddress(CONTRACT_NAMES.ETH_2X_REBALANCE_VIEWER);
    if (checkFLIRebalanceViewerAddress === "") {
      const uniswapRouter = await findDependency(UNISWAP_V2_ROUTER);
      const fliStrategyAdapter = await findDependency(CONTRACT_NAMES.FLEXIBLE_LEVERAGE_ADAPTER);
      const cEther = await findDependency(C_ETH);

      const fliRebalanceViewer = await deploy(
        CONTRACT_NAMES.FLI_REBALANCE_VIEWER,
        { from: deployer, args: [uniswapRouter, fliStrategyAdapter, cEther], log: true }
      );
      fliRebalanceViewer.receipt &&
        await writeContractAndTransactionToOutputs(
          CONTRACT_NAMES.ETH_2X_REBALANCE_VIEWER,
          fliRebalanceViewer.address,
          fliRebalanceViewer.receipt.transactionHash,
          `Deployed ${CONTRACT_NAMES.ETH_2X_REBALANCE_VIEWER}`
        );
    }
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;