import { ether } from "@utils/common";
import { BigNumber } from "ethers";

export const CONTRACT_NAMES = {
    INDEX_TOKEN: "IndexToken",
    OTC_ESCROW: "OtcEscrow",
};

export const INDEX_GOV = "0xce071Ba2E54e7fa97F063c8526f53eD6470c5b6D";
export const USDC = "0x0e7981b889a85349cbc9d30b9a4c8ebbc2c848df";
export const VESTING_START = 1621537200;
export const VESTING_CLIFF = 1621537500;
export const VESTING_END = 1621537800;

export const INVESTOR_DETAILS = [
    {
        address: "0x25D9D2D38Fa590ccfeb3c59d12Daa30297380666",
        usdcAmount: BigNumber.from(100).mul(10 ** 6),
        indexAmount: ether(100),
    },
];