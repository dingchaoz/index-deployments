import "module-alias/register";
import { deployments } from "hardhat";

import { Account } from "@utils/types";
import {
  FLIRebalanceViewer,
  FLIRebalanceViewer__factory
} from "@set/typechain/index";
import {
  addSnapshotBeforeRestoreAfterEach,
  getAccounts,
  getWaffleExpect,
} from "@utils/index";
import {
  findDependency,
  getContractAddress,
  DEPENDENCY
} from "@deployments/utils";
import { CONTRACT_NAMES } from "@deployments/constants/009_fli_rebalance_viewer";

const expect = getWaffleExpect();

describe("FLIRebalanceViewer", () => {
  let deployer: Account;

  let rebalanceViewer: FLIRebalanceViewer;

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    await deployments.fixture();

    const viewerDeploy  = await getContractAddress(CONTRACT_NAMES.ETH_2X_REBALANCE_VIEWER);
    rebalanceViewer = new FLIRebalanceViewer__factory(deployer.wallet).attach(viewerDeploy);
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("FLIRebalanceViewer", async () => {
    it("should have the correct uniswap router address", async () => {
      const uniswapRouter = await rebalanceViewer.uniswapRouter();
      expect(uniswapRouter).to.eq(await findDependency(DEPENDENCY.UNISWAP_V2_ROUTER));
    });

    it("should have the correct flexible leverage adapter", async () => {
      const strategyAdapter = await rebalanceViewer.strategyAdapter();
      expect(strategyAdapter).to.eq(await findDependency(CONTRACT_NAMES.FLEXIBLE_LEVERAGE_ADAPTER));
    });

    it("should have the correct cEther", async () => {
      const cEther = await rebalanceViewer.cEther();
      expect(cEther).to.eq(await findDependency(DEPENDENCY.C_ETH));
    });
  });
});