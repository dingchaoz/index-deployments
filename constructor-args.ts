import { BigNumber } from "@ethersproject/bignumber";
import { ether } from "./utils/index"
import { ONE_DAY_IN_SECONDS, EMPTY_BYTES } from "./deployments/utils/constants"


const CONTRACT_SETTINGS = {
  setToken: "0xDC11c313a28A68c6Fc4df718DD93f057849e8208",
  leverageModule: "0xdD668Fa631C0b3F863e3A830ca23Fe75100009e6",
  comptroller: "0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b",
  priceOracle: "0x922018674c12a7f0d394ebeef9b58f186cde13c1",
  targetCollateralCToken: "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5",
  targetBorrowCToken: "0x39aa39c021dfbae8fac545936693ac917d5e7563",
  collateralAsset: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  borrowAsset: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
}

const METHODOLOGY_SETTINGS = {
  targetLeverageRatio: ether(2),                          // 2x according to ETHFLI proposal
  minLeverageRatio: ether(1.7),                           // 1.7x according to FLI proposal
  maxLeverageRatio: ether(2.3),                           // 2.3x according to FLI proposal
  recenteringSpeed: ether(0.05),                          // 5% recentering speed according to FLI proposal
  rebalanceInterval: ONE_DAY_IN_SECONDS,                  // 1 day rebalance interval
};
  
const EXECUTION_SETTINGS = {
  unutilizedLeveragePercentage: ether(0.01),               // 1% of leverage as buffer from max borrow
  twapMaxTradeSize: ether(600),                           // 600 ETH max trade size ~0.6% price impact
  twapCooldownPeriod: BigNumber.from(30),                 // 30 sec cooldown
  slippageTolerance: ether(0.02),                         // 2% max slippage on regular rebalances
  exchangeName: "UniswapV2ExchangeAdapter",                // Use Uniswap as initial exchange
  exchangeData: EMPTY_BYTES,                              // Empty exchange data as there is a direct route from ETH <-> USDC
};
  
const INCENTIVE_SETTINGS = {
  incentivizedTwapMaxTradeSize: ether(1200),               // 1200 ETH max trade size ~1.2% price impact on ripcord
  incentivizedTwapCooldownPeriod: BigNumber.from(1),      // 1 sec cooldown on ripcord
  incentivizedSlippageTolerance: ether(0.05),             // 5% max slippage on ripcord
  etherReward: ether(1),                                  // 1000 gwei * 700k gas used = 0.7 ETH
  incentivizedLeverageRatio: ether(2.7),                  // 1 ripcord will return back to 2.3x
};

module.exports = [
  "0x64fe9141c8E407887535471815aF3D31B5E355D5",
  CONTRACT_SETTINGS,
  METHODOLOGY_SETTINGS,
  EXECUTION_SETTINGS,
  INCENTIVE_SETTINGS
];