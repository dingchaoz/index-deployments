import { ether } from "@utils/common";
import { BigNumber } from "ethers";

export const CONTRACT_NAMES = {
  INDEX_TOKEN: "IndexToken",
  OTC_ESCROW: "OtcEscrow",
};

export const VESTING_START = 1624060800; // June 19th 2021 0:00 UTC
export const VESTING_CLIFF = 1655596800; // June 19th 2022 0:00 UTC
export const VESTING_END = 1671408000;   // December 19th 2022 0:00 UTC

export const INVESTOR_DETAILS = [
  // LD Capital
  {
    address: "0x5BCF61c5E5C72457003feD3d292AAEA1c06f3691",
    usdcAmount: BigNumber.from(300000).mul(10 ** 6), // 300k USDC
    indexAmount: ether(12367),                       // 12,367.00 INDEX
  },
  // Blockchain.com
  {
    address: "0x7E2E80E8250844Dd4E558f13850380D5af8F0C61",
    usdcAmount: BigNumber.from(750000).mul(10 ** 6), // 750k USDC
    indexAmount: ether(30919),                       // 30,919.00 INDEX
  },
  // Galaxy
  {
    address: "0xe1B6e4C28127C4704838A0a2d6c6F7c344944B22",
    usdcAmount: BigNumber.from(1000000).mul(10 ** 6), // 1M USDC
    indexAmount: ether(41226),                        // 41,226.00 INDEX
  },
  // Joe Flanagan/Sid Powell (Maple)
  {
    address: "0xd16295DEA1115C9df62FC35017bB359fb1E6d639",
    usdcAmount: BigNumber.from(30000).mul(10 ** 6), // 30k USDC
    indexAmount: ether(1236),                       // 1,236.00 INDEX
  },
  // Reuben Bramathan (IDEO)
  {
    address: "0xAA023910e301E23400bc4871c3cCCD58997E2327",
    usdcAmount: BigNumber.from(25000).mul(10 ** 6), // 25k USDC
    indexAmount: ether(1030),                       // 1,030.00 INDEX
  },
  // Graham Jenkin (CoinList)
  {
    address: "0x3b2cbBe6B4656548E995b26dF0954d31C081e0e5",
    usdcAmount: BigNumber.from(25000).mul(10 ** 6), // 25k USDC
    indexAmount: ether(1030),                       // 1,030.00 INDEX
  },
  // Blake (LD Cap Partner)
  {
    address: "0x0C497bD20de89D9b14637415405690Ce1B1fD62f",
    usdcAmount: BigNumber.from(50000).mul(10 ** 6), // 50k USDC
    indexAmount: ether(2061),                       // 2,061.00 INDEX
  },
];
