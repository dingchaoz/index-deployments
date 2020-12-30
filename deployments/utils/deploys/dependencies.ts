
export default {
  // TOKENS

  DPI: {
    1: "0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b",
    42: "0xEA41F11c916813EDa966a4e1a0b09c98C4bbC555",
  },
  DPI_ETH_UNI_POOL: {
    1: "0x4d5ef58aac27d99935e5b6b4a6778ff292059991",
    42: "0x64cf6e538ce757645a953376c0f1be6fab8a2e09",
  },

  // Set Protocol Contracts
  STREAMING_FEE_MODULE: {
    1: "0x08f866c74205617B6F3903EF481798EcED10cDEC",
    42: "0xE038E59DEEC8657d105B6a3Fb5040b3a6189Dd51",
  },
  SINGLE_INDEX_MODULE: {
    1: "0x25100726b25a6ddb8f8e68988272e1883733966e",
    42: "0x8398f4710d35c8f15a7e4eced3e7b6a0e909d019",
  },

  // Admin
  TREASURY_MULTI_SIG: {
    1: "0x9467cfADC9DE245010dF95Ec6a585A506A8ad5FC",
  },
  SET_LABS: {
    1: "0xF8523c551763FE4261A28313015267F163de7541",
  },
  DFP_MULTI_SIG: {
    1: "0x673d140Eed36385cb784e279f8759f495C97cF03",
  },
  HUMAN_FRIENDLY_NAMES: {
    1: "main-net",
    42: "kovan",
    50: "test-rpc",
  },
} as any;

export const DEPENDENCY = {
  // Tokens
  DPI: "DPI",
  TREASURY_MULTI_SIG: "TREASURY_MULTI_SIG",
  DFP_MULTI_SIG: "DFP_MULTI_SIG",
  SET_LABS: "SET_LABS",
  SINGLE_INDEX_MODULE: "SINGLE_INDEX_MODULE",
  STREAMING_FEE_MODULE: "STREAMING_FEE_MODULE",
  DPI_ETH_UNI_POOL: "DPI_ETH_UNI_POOL",
};