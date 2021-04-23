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
import { CONTRACT_NAMES } from "@deployments/constants/013_btcfli_rebalance_viewer";

const expect = getWaffleExpect();

describe("BTCFLIRebalanceViewer", () => {
  let deployer: Account;

  let rebalanceViewer: FLIRebalanceViewer;

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    await deployments.fixture();

    const viewerDeploy  = await getContractAddress(CONTRACT_NAMES.BTC_2X_REBALANCE_VIEWER);
    rebalanceViewer = new FLIRebalanceViewer__factory(deployer.wallet).attach(viewerDeploy);
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("FLIRebalanceViewer", async () => {
    it("should have the correct uniswap router address", async () => {
      const router = await rebalanceViewer.uniswapRouter();
      expect(router).to.eq(await findDependency(DEPENDENCY.SUSHISWAP_ROUTER));
    });

    it("should have the correct flexible leverage adapter", async () => {
      const strategyAdapter = await rebalanceViewer.strategyAdapter();
      expect(strategyAdapter).to.eq(await findDependency(CONTRACT_NAMES.FLEXIBLE_LEVERAGE_ADAPTER_NAME));
    });

    it("should have the correct cEther", async () => {
      const cEther = await rebalanceViewer.cEther();
      expect(cEther).to.eq(await findDependency(DEPENDENCY.C_ETH));
    });
  });
});