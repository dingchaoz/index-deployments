import { BigNumber } from "@ethersproject/bignumber";
import { ether } from "@utils/index";
import { ONE_DAY_IN_SECONDS } from "@deployments/utils/constants";

export const CONTRACT_NAMES = {
  BASE_MANAGER: "BaseManager",
  FLEXIBLE_LEVERAGE_ADAPTER: "FlexibleLeverageStrategyAdapter",
  STANDARD_TOKEN_MOCK: "StandardTokenMock",
  FEE_SPLIT_ADAPTER: "FeeSplitAdapter",
  SUPPLY_CAP_ISSUANCE_HOOK: "SupplyCapIssuanceHook",
};

export const FEE_SPLIT_ADAPTER = {
  FEE_SPLIT: ether(.6),                                   // 60% operator, 40% methodologist fee split
};

export const SUPPLY_CAP_ISSUANCE_HOOK = {
  SUPPLY_CAP: ether(50000),                               // At $100 ETHFLI supply cap is $5M
};

export const METHODOLOGY_SETTINGS = {
  targetLeverageRatio: ether(2),                          // 2x according to ETHFLI proposal
  minLeverageRatio: ether(1.7),                           // 1.7x according to FLI proposal
  maxLeverageRatio: ether(2.3),                           // 2.3x according to FLI proposal
  recenteringSpeed: ether(0.05),                          // 5% recentering speed according to FLI proposal
  rebalanceInterval: ONE_DAY_IN_SECONDS,                  // 1 day rebalance interval
};

export const EXECUTION_SETTINGS = {
  unutilizedLeveragePercentage: ether(0.01),               // 1% of leverage as buffer from max borrow
  twapMaxTradeSize: ether(600),                           // 600 ETH max trade size ~0.6% price impact
  twapCooldownPeriod: BigNumber.from(30),                 // 30 sec cooldown
  slippageTolerance: ether(0.02),                         // 2% max slippage on regular rebalances
  exchangeName: "UniswapV2ExchangeAdapter",                // Use Uniswap as initial exchange
};

export const INCENTIVE_SETTINGS = {
  incentivizedTwapMaxTradeSize: ether(1200),               // 1200 ETH max trade size ~1.2% price impact on ripcord
  incentivizedTwapCooldownPeriod: BigNumber.from(1),      // 1 sec cooldown on ripcord
  incentivizedSlippageTolerance: ether(0.05),             // 5% max slippage on ripcord
  etherReward: ether(1),                                  // 1000 gwei * 700k gas used = 0.7 ETH
  incentivizedLeverageRatio: ether(2.7),                  // 1 ripcord will return back to 2.3x
};