import { ether } from "@utils/common";
import { BigNumber } from "ethers";

export const CONTRACT_NAMES = {
  INDEX_TOKEN: "IndexToken",
  OTC_ESCROW: "OtcEscrow",
};

export const VESTING_START = 1622185200;
export const VESTING_CLIFF = 1653721200;
export const VESTING_END = 1669276800;

export const INVESTOR_DETAILS = [
  // Assembly Capital
  {
      address: "0x9fB64b232dEa3ba6e020F517b2BC8aFd0145880c",
      usdcAmount: BigNumber.from(1000000).mul(10 ** 6), // 1M USDC
      indexAmount: ether(37478),                        // 37,478.00 INDEX
  },
  // Wintermute
  {
      address: "0x4f3a120E72C76c22ae802D129F599BFDbc31cb81",
      usdcAmount: BigNumber.from(500000).mul(10 ** 6), // 500k USDC
      indexAmount: ether(18739),                       // 18,739.00 INDEX
  },
  // Defiance Capital 1
  {
      address: "0x9B5ea8C719e29A5bd0959FaF79C9E5c8206d0499",
      usdcAmount: BigNumber.from(750000).mul(10 ** 6), // 750k USDC
      indexAmount: ether(28108),                       // 28,108.00 INDEX
  },
  // Defiance Capital 2
  {
      address: "0xdD709cAE362972cb3B92DCeaD77127f7b8D58202",
      usdcAmount: BigNumber.from(750000).mul(10 ** 6), // 750k USDC
      indexAmount: ether(28108),                       // 28,108.00 INDEX
  },
  // 1confirmation
  {
      address: "0x0A842c38fb93993bD6353a4afc784ccB99522359",
      usdcAmount: BigNumber.from(500000).mul(10 ** 6), // 500k USDC
      indexAmount: ether(18739),                       // 18,739.00 INDEX
  },
  // LD Capital
  {
      address: "0xbFC94A95d4448C802E848C68fdD2FC0fEE4a876E",
      usdcAmount: BigNumber.from(300000).mul(10 ** 6), // 300k USDC
      indexAmount: ether(11243),                       // 11,243.00 INDEX
  },
  // 1kex
  {
      address: "0x70044278D556B0C962224e095397A52287C99cB5",
      usdcAmount: BigNumber.from(2600000).mul(10 ** 6), // 2.6M USDC
      indexAmount: ether(97444),                        // 97,444 INDEX
  },
  // Bridgewater Innovation
  {
      address: "0xb2c9d26f10c36Ce43Ce46156e7833DFBA00A7276",
      usdcAmount: BigNumber.from(200000).mul(10 ** 6), // 200k USDC
      indexAmount: ether(7495),                        // 7,495 INDEX
  },
  // Phil Dario
  {
      address: "0x578152463e01DE0FC1331250351dd6D11dAFD9b3",
      usdcAmount: BigNumber.from(100000).mul(10 ** 6), // 100k USDC
      indexAmount: ether(3747),                         // 3747.00 INDEX
  },
  // New Form Capital
  {
      address: "0x719a363735dFa5023033640197359665072b8C0E",
      usdcAmount: BigNumber.from(500000).mul(10 ** 6), // 100k USDC
      indexAmount: ether(18739),                       // 18,739.00 INDEX
  },
];