import { ether } from "@utils/common";
import { BigNumber } from "ethers";

export const CONTRACT_NAMES = {
    INDEX_TOKEN: "IndexToken",
    OTC_ESCROW: "OtcEscrow",
};

export const INDEX_GOV = "0xe076d1041f403ae5d9a355a0ea62b6e91f7c8b8c";
export const USDC = "0x7079f3762805cff9c979a5bdc6f5648bcfee76c8";
export const VESTING_START = 1621580400;
export const VESTING_CLIFF = 1653116400;
export const VESTING_END = 1668672000;

export const INVESTOR_DETAILS = [
    {
        address: "0x7079f3762805cff9c979a5bdc6f5648bcfee76c8",
        usdcAmount: BigNumber.from(100).mul(10 ** 6),
        indexAmount: ether(1000),
    },
    {
        address: "0x7079f3762805cff9c979a5bdc6f5648bcfee76c9",
        usdcAmount: BigNumber.from(100).mul(10 ** 6),
        indexAmount: ether(1000),
    },
];