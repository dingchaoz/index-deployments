import { BigNumber } from "@ethersproject/bignumber";
import { bitcoin, ether } from "@utils/index";
import { ONE_DAY_IN_SECONDS } from "@deployments/utils/constants";

export const CONTRACT_NAMES = {
  BASE_MANAGER: "BaseManager",
  BASE_MANAGER_NAME: "BTCFLIBaseManager",
  STANDARD_TOKEN_MOCK: "StandardTokenMock",
  FLEXIBLE_LEVERAGE_ADAPTER: "FlexibleLeverageStrategyAdapter",
  FLEXIBLE_LEVERAGE_ADAPTER_NAME: "BTCFlexibleLeverageStrategyAdapter",
  FEE_SPLIT_ADAPTER: "FeeSplitAdapter",
  FEE_SPLIT_ADAPTER_NAME: "BTCFLIFeeSplitAdapter",
  SUPPLY_CAP_ISSUANCE_HOOK: "SupplyCapAllowedCallerIssuanceHook",
  SUPPLY_CAP_ISSUANCE_HOOK_NAME: "BTCFLISupplyCapAllowedCallerIssuanceHook",
};


export const CONTRACT_SETTINGS = {
  COLLATERAL_DECIMAL_ADJUSTMENT: BigNumber.from(20),      // Decimal adjustment for chainlink Equal to 28-decimals (10^18 * 10^18 / 10^dec / 10^8)
  BORROW_DECIMAL_ADJUSTMENT: BigNumber.from(22),          // Decimal adjustment for chainlink. Equal to 28-decimals (10^18 * 10^18 / 10^dec / 10^8)
};

export const FEE_SPLIT_ADAPTER = {
  FEE_SPLIT: ether(.6),                                   // 60% operator, 40% methodologist fee split
};

export const SUPPLY_CAP_ISSUANCE_HOOK = {
  SUPPLY_CAP: ether(200000),                               // At $100 BTCFLI supply cap is $20M
};

export const METHODOLOGY_SETTINGS = {
  targetLeverageRatio: ether(2),                          // 2x according to BTCFLI proposal
  minLeverageRatio: ether(1.8),                           // 1.8x according to FLI proposal
  maxLeverageRatio: ether(2.2),                           // 2.2x according to FLI proposal
  recenteringSpeed: ether(0.1),                          // 5% recentering speed according to FLI proposal
  rebalanceInterval: ONE_DAY_IN_SECONDS,                  // 1 day rebalance interval
};

export const EXECUTION_SETTINGS = {
  unutilizedLeveragePercentage: ether(0.01),               // 1% of leverage as buffer from max borrow
  twapMaxTradeSize: bitcoin(20),                           // 20 WBTC max trade size ~0.7% price impact
  twapCooldownPeriod: BigNumber.from(30),                  // 30 sec cooldown
  slippageTolerance: ether(0.02),                          // 2% max slippage on regular rebalances
  exchangeName: "SushiswapExchangeAdapter",                // Use Sushi as initial exchange
};

export const INCENTIVE_SETTINGS = {
  incentivizedTwapMaxTradeSize: bitcoin(40),              // 40 WBTC max trade size ~1.4% price impact on ripcord
  incentivizedTwapCooldownPeriod: BigNumber.from(1),      // 1 sec cooldown on ripcord
  incentivizedSlippageTolerance: ether(0.05),             // 5% max slippage on ripcord
  etherReward: ether(1.5),                                // 2000 gwei * 700k gas used = 1.4 ETH
  incentivizedLeverageRatio: ether(2.4),                  // A 11% drop from 2.4x results in liquidation for WBTC with 65% CF
};