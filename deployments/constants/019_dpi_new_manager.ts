import { ether } from "@utils/index";

export const CONTRACT_NAMES = {
  BASE_MANAGER_NAME: "BaseManager - DPI",
  FEE_SPLIT_ADAPTER_NAME: "FeeSplitAdapter - DPI",
  GOVERNANCE_ADAPTER_NAME: "GovernanceAdapter - DPI",
};

export const FEE_SPLIT_ADAPTER = {
  FEE_SPLIT: ether(.6),                       // 60% operator, 40% methodologist fee split
};