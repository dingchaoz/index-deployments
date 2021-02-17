import "module-alias/register";
import { deployments } from "hardhat";

import { Account } from "@utils/types";
import { ONE_DAY_IN_SECONDS, EMPTY_BYTES } from "@deployments/utils/constants";
import { FlexibleLeverageStrategyAdapter, ICManagerV2 } from "@deployments/utils/contracts/index";
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
import { ICManagerV2__factory } from "@setprotocol/index-coop-contracts/dist/typechain/factories/ICManagerV2__factory";

const expect = getWaffleExpect();

describe("ETHFLI System", () => {
  let deployer: Account;

  let icManagerV2Instance: ICManagerV2;
  let flexibleLeverageStrategyAdapterInstance: FlexibleLeverageStrategyAdapter;

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    await deployments.fixture();

    const deployedICManagerV2Contract = await getContractAddress("ICManagerV2");
    icManagerV2Instance = new ICManagerV2__factory(deployer.wallet).attach(deployedICManagerV2Contract);

    const deployedFlexibleLeverageStrategyAdapterContract = await getContractAddress("FlexibleLeverageStrategyAdapter");
    flexibleLeverageStrategyAdapterInstance =
      new FlexibleLeverageStrategyAdapter__factory(deployer.wallet).attach(deployedFlexibleLeverageStrategyAdapterContract);
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("ICManagerV2", async () => {
    it("should have the correct SetToken address", async () => {
      const setToken = await icManagerV2Instance.setToken();
      expect(setToken).to.eq(await findDependency("ETHFLI"));
    });

    it("should have the correct operator address", async () => {
      const operator = await icManagerV2Instance.operator();
      expect(operator).to.eq(deployer.address);
    });

    it("should have the correct methodologist address", async () => {
      const methodologist = await icManagerV2Instance.methodologist();
      expect(methodologist).to.eq(deployer.address);
    });

    it("should have the correct adapters", async () => {
      const adapters = await icManagerV2Instance.getAdapters();
      expect(adapters[0]).to.eq(flexibleLeverageStrategyAdapterInstance.address);
    });
  });

  describe("FlexibleLeverageStrategyAdapter", async () => {
     it("should set the contract addresses", async () => {
      const setToken = await flexibleLeverageStrategyAdapterInstance.setToken();
      const leverageModule = await flexibleLeverageStrategyAdapterInstance.leverageModule();
      const manager = await flexibleLeverageStrategyAdapterInstance.manager();
      const comptroller = await flexibleLeverageStrategyAdapterInstance.comptroller();
      const compoundPriceOracle = await flexibleLeverageStrategyAdapterInstance.priceOracle();
      const targetCollateralCToken = await flexibleLeverageStrategyAdapterInstance.targetCollateralCToken();
      const targetBorrowCToken = await flexibleLeverageStrategyAdapterInstance.targetBorrowCToken();
      const collateralAsset = await flexibleLeverageStrategyAdapterInstance.collateralAsset();
      const borrowAsset = await flexibleLeverageStrategyAdapterInstance.borrowAsset();

      expect(setToken).to.eq(await findDependency("ETHFLI"));
      expect(leverageModule).to.eq(await findDependency("COMPOUND_LEVERAGE_MODULE"));
      expect(manager).to.eq(icManagerV2Instance.address);
      expect(comptroller).to.eq(await findDependency("COMPOUND_COMPTROLLER"));
      expect(compoundPriceOracle).to.eq(await findDependency("COMPOUND_PRICE_ORACLE"));
      expect(targetCollateralCToken).to.eq(await findDependency("C_ETH"));
      expect(targetBorrowCToken).to.eq(await findDependency("C_USDC"));
      expect(collateralAsset).to.eq(await findDependency("WETH"));
      expect(borrowAsset).to.eq(await findDependency("USDC"));
    });

    it("should set the correct methodology parameters", async () => {
      const targetLeverageRatio = await flexibleLeverageStrategyAdapterInstance.targetLeverageRatio();
      const minLeverageRatio = await flexibleLeverageStrategyAdapterInstance.minLeverageRatio();
      const maxLeverageRatio = await flexibleLeverageStrategyAdapterInstance.maxLeverageRatio();
      const recenteringSpeed = await flexibleLeverageStrategyAdapterInstance.recenteringSpeed();
      const rebalanceInterval = await flexibleLeverageStrategyAdapterInstance.rebalanceInterval();

      expect(targetLeverageRatio).to.eq(ether(2));
      expect(minLeverageRatio).to.eq(ether(1.7));
      expect(maxLeverageRatio).to.eq(ether(2.3));
      expect(recenteringSpeed).to.eq(ether(0.05));
      expect(rebalanceInterval).to.eq(ONE_DAY_IN_SECONDS);
    });

    it("should set the correct execution parameters", async () => {
      const unutilizedLeveragePercentage = await flexibleLeverageStrategyAdapterInstance.unutilizedLeveragePercentage();
      const twapMaxTradeSize = await flexibleLeverageStrategyAdapterInstance.twapMaxTradeSize();
      const twapCooldownPeriod = await flexibleLeverageStrategyAdapterInstance.twapCooldownPeriod();
      const slippageTolerance = await flexibleLeverageStrategyAdapterInstance.slippageTolerance();

      expect(unutilizedLeveragePercentage).to.eq(ether(0.1));
      expect(twapMaxTradeSize).to.eq(ether(600));
      expect(twapCooldownPeriod).to.eq(BigNumber.from(2 * 60));
      expect(slippageTolerance).to.eq(ether(0.02));
    });

    it("should set the correct incentive parameters", async () => {
      const incentivizedTwapMaxTradeSize = await flexibleLeverageStrategyAdapterInstance.incentivizedTwapMaxTradeSize();
      const incentivizedTwapCooldownPeriod = await flexibleLeverageStrategyAdapterInstance.incentivizedTwapCooldownPeriod();
      const incentivizedSlippageTolerance = await flexibleLeverageStrategyAdapterInstance.incentivizedSlippageTolerance();
      const etherReward = await flexibleLeverageStrategyAdapterInstance.etherReward();
      const incentivizedLeverageRatio = await flexibleLeverageStrategyAdapterInstance.incentivizedLeverageRatio();

      expect(incentivizedTwapMaxTradeSize).to.eq(ether(1200));
      expect(incentivizedTwapCooldownPeriod).to.eq(BigNumber.from(60));
      expect(incentivizedSlippageTolerance).to.eq(ether(0.05));
      expect(etherReward).to.eq(ether(0.3));
      expect(incentivizedLeverageRatio).to.eq(ether(3.5));
    });

    it("should set the correct initial exchange name", async () => {
      const exchangeName = await flexibleLeverageStrategyAdapterInstance.exchangeName();

      expect(exchangeName).to.eq("UniswapV2ExchangeAdapter");
    });

    it("should set the correct initial exchange data", async () => {
      const exchangeData = await flexibleLeverageStrategyAdapterInstance.exchangeData();

      expect(exchangeData).to.eq(EMPTY_BYTES);
    });
  });
});