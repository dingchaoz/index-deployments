import "module-alias/register";
import { deployments } from "hardhat";

import { Account } from "@utils/types";
import { ONE_DAY_IN_SECONDS, EMPTY_BYTES } from "@deployments/utils/constants";
import { FlexibleLeverageStrategyAdapter, FeeSplitAdapter, BaseManager, SupplyCapIssuanceHook } from "@deployments/utils/contracts/index";
import { BigNumber } from "@ethersproject/bignumber";
import {
  addSnapshotBeforeRestoreAfterEach,
  ether,
  getAccounts,
  getWaffleExpect,
} from "@utils/index";
import {
  findDependency,
  getContractAddress,
} from "@deployments/utils/deploys/outputHelper";

import { FlexibleLeverageStrategyAdapter__factory } from "@setprotocol/index-coop-contracts/dist/typechain/factories/FlexibleLeverageStrategyAdapter__factory";
import { FeeSplitAdapter__factory } from "@setprotocol/index-coop-contracts/dist/typechain/factories/FeeSplitAdapter__factory";
import { BaseManager__factory } from "@setprotocol/index-coop-contracts/dist/typechain/factories/BaseManager__factory";
import { SupplyCapIssuanceHook__factory } from "@setprotocol/index-coop-contracts/dist/typechain/factories/SupplyCapIssuanceHook__factory";

const expect = getWaffleExpect();

describe("ETHFLI System", () => {
  let deployer: Account;

  let baseManagerInstance: BaseManager;
  let flexibleLeverageStrategyAdapterInstance: FlexibleLeverageStrategyAdapter;
  let feeSplitAdapterInstance: FeeSplitAdapter;
  let supplyCapInstance: SupplyCapIssuanceHook;

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    await deployments.fixture();

    const deployedBaseManagerContract = await getContractAddress("BaseManager");
    baseManagerInstance = new BaseManager__factory(deployer.wallet).attach(deployedBaseManagerContract);

    const deployedFlexibleLeverageStrategyAdapterContract = await getContractAddress("FlexibleLeverageStrategyAdapter");
    flexibleLeverageStrategyAdapterInstance =
      new FlexibleLeverageStrategyAdapter__factory(deployer.wallet).attach(deployedFlexibleLeverageStrategyAdapterContract);

    const deployedFeeSplitAdapterContract = await getContractAddress("FeeSplitAdapter");
    feeSplitAdapterInstance = new FeeSplitAdapter__factory(deployer.wallet).attach(deployedFeeSplitAdapterContract);

    const deployedSupplyCapIssuanceHookContract = await getContractAddress("SupplyCapIssuanceHook");
    supplyCapInstance = new SupplyCapIssuanceHook__factory(deployer.wallet).attach(deployedSupplyCapIssuanceHookContract);
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("BaseManager", async () => {
    it("should have the correct SetToken address", async () => {
      const setToken = await baseManagerInstance.setToken();
      expect(setToken).to.eq(await findDependency("ETHFLI"));
    });

    it("should have the correct operator address", async () => {
      const operator = await baseManagerInstance.operator();
      expect(operator).to.eq(deployer.address);
    });

    it("should have the correct methodologist address", async () => {
      const methodologist = await baseManagerInstance.methodologist();
      expect(methodologist).to.eq(deployer.address);
    });

    it("should have the correct adapters", async () => {
      const adapters = await baseManagerInstance.getAdapters();
      expect(adapters[0]).to.eq(flexibleLeverageStrategyAdapterInstance.address);
      expect(adapters[1]).to.eq(feeSplitAdapterInstance.address);
    });
  });

  describe("FlexibleLeverageStrategyAdapter", async () => {
    it("should set the manager", async () => {
      const manager = await flexibleLeverageStrategyAdapterInstance.manager();

      expect(manager).to.eq(baseManagerInstance.address);
    });

    it("should set the contract addresses", async () => {
      const strategy = await flexibleLeverageStrategyAdapterInstance.getStrategy();

      expect(strategy.setToken).to.eq(await findDependency("ETHFLI"));
      expect(strategy.leverageModule).to.eq(await findDependency("COMPOUND_LEVERAGE_MODULE"));
      expect(strategy.comptroller).to.eq(await findDependency("COMPOUND_COMPTROLLER"));
      expect(strategy.priceOracle).to.eq(await findDependency("COMPOUND_PRICE_ORACLE"));
      expect(strategy.targetCollateralCToken).to.eq(await findDependency("C_ETH"));
      expect(strategy.targetBorrowCToken).to.eq(await findDependency("C_USDC"));
      expect(strategy.collateralAsset).to.eq(await findDependency("WETH"));
      expect(strategy.borrowAsset).to.eq(await findDependency("USDC"));
    });

    it("should set the correct methodology parameters", async () => {
      const methodology = await flexibleLeverageStrategyAdapterInstance.getMethodology();

      expect(methodology.targetLeverageRatio).to.eq(ether(2));
      expect(methodology.minLeverageRatio).to.eq(ether(1.7));
      expect(methodology.maxLeverageRatio).to.eq(ether(2.3));
      expect(methodology.recenteringSpeed).to.eq(ether(0.05));
      expect(methodology.rebalanceInterval).to.eq(ONE_DAY_IN_SECONDS);
    });

    it("should set the correct execution parameters", async () => {
      const execution = await flexibleLeverageStrategyAdapterInstance.getExecution();

      expect(execution.exchangeName).to.eq("UniswapV2ExchangeAdapter");
      expect(execution.exchangeData).to.eq(EMPTY_BYTES);
      expect(execution.unutilizedLeveragePercentage).to.eq(ether(0.01));
      expect(execution.twapMaxTradeSize).to.eq(ether(600));
      expect(execution.twapCooldownPeriod).to.eq(BigNumber.from(30));
      expect(execution.slippageTolerance).to.eq(ether(0.02));
    });

    it("should set the correct incentive parameters", async () => {
      const incentive = await flexibleLeverageStrategyAdapterInstance.getIncentive();

      expect(incentive.incentivizedTwapMaxTradeSize).to.eq(ether(1200));
      expect(incentive.incentivizedTwapCooldownPeriod).to.eq(BigNumber.from(1));
      expect(incentive.incentivizedSlippageTolerance).to.eq(ether(0.05));
      expect(incentive.etherReward).to.eq(ether(1));
      expect(incentive.incentivizedLeverageRatio).to.eq(ether(2.7));
    });
  });

  describe("FeeSplitAdapter", async () => {
    it("should set the correct addresses", async () => {
      const manager = await feeSplitAdapterInstance.manager();
      const streamingFeeModule = await feeSplitAdapterInstance.streamingFeeModule();
      const issuanceModule = await feeSplitAdapterInstance.issuanceModule();
      const operatorFeeSplit = await feeSplitAdapterInstance.operatorFeeSplit();

      expect(manager).to.eq(baseManagerInstance.address);
      expect(streamingFeeModule).to.eq(await findDependency("STREAMING_FEE_MODULE"));
      expect(issuanceModule).to.eq(await findDependency("DEBT_ISSUANCE_MODULE"));
      expect(operatorFeeSplit).to.eq(ether(0.6));
    });
  });

  describe("SupplyCapIssuanceHook", async () => {
    it("should set the correct owner", async () => {
      const owner = await supplyCapInstance.owner();

      expect(owner).to.eq(deployer.address);
    });

    it("should set the correct supply cap", async () => {
      const supplyCap = await supplyCapInstance.supplyCap();

      expect(supplyCap).to.eq(ether(50000));
    });
  });
});