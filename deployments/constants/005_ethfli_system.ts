import { BigNumber } from "@ethersproject/bignumber";
import { ether } from "@utils/index";
import { ONE_DAY_IN_SECONDS, EMPTY_BYTES } from "@deployments/utils/constants";

export const CONTRACT_NAMES = {
  IC_MANAGER_V2: "ICManagerV2",
  FLEXIBLE_LEVERAGE_ADAPTER: "FlexibleLeverageStrategyAdapter",
  STANDARD_TOKEN_MOCK: "StandardTokenMock",
};

export const FLI_STRATEGY_PARAMS = {
  targetLeverageRatio: ether(2),													// 2x according to ETHFLI proposal
  minLeverageRatio: ether(1.7),														// 1.7x according to FLI proposal
  maxLeverageRatio: ether(2.3),														// 2.3x according to FLI proposal
  recenteringSpeed: ether(0.05),													// 5% recentering speed according to FLI proposal
  rebalanceInterval: ONE_DAY_IN_SECONDS,									// 1 day rebalance interval
  unutilizedLeveragePercentage: ether(0.1), 							// 10% of leverage as buffer from max borrow
  twapMaxTradeSize: ether(600), 													// 600 ETH max trade size ~0.6% price impact
  twapCooldownPeriod: BigNumber.from(2 * 60), 						// 2 minutes cooldown
  slippageTolerance: ether(0.02), 												// 2% max slippage on regular rebalances
  incentivizedTwapMaxTradeSize: ether(1200), 							// 1200 ETH max trade size ~1.2% price impact on ripcord
  incentivizedTwapCooldownPeriod: BigNumber.from(60),	  	// 1 minute cooldown on ripcord
  incentivizedSlippageTolerance: ether(0.05), 						// 5% max slippage on ripcord
  etherReward: ether(0.3),																// 400 gwei * 700k gas used = 0.28 ETH
  incentivizedLeverageRatio: ether(3.5),									// ~30% drop in price from target leverage ratio, 140% collateralization
  exchangeName: "UniswapV2ExchangeAdapter",								// Use Uniswap as initial exchange
  exchangeData: EMPTY_BYTES,															// Empty exchange data as there is a direct route from ETH <-> USDC
};