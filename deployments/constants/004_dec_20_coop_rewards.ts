import { DECEMBER_MERKLE_DISTRIBUTION } from "@deployments/utils/deploys/rewards/dec20Distribution";
import { parseBalanceMap } from "@deployments/utils";

import { DistributionFormat } from "@utils/types";

const distributionArray: DistributionFormat[] = DECEMBER_MERKLE_DISTRIBUTION;

export const MERKLE_ROOT_OBJECT = parseBalanceMap(distributionArray); // Merkle root object

export const CONTRACT_NAMES = {
  INDEX_TOKEN: "IndexToken",
  REWARDS_DEC20_MERKLE_DISTRIBUTOR: "RewardsDec20MerkleDistributor",
  MERKLE_DISTRIBUTOR: "MerkleDistributor",
};