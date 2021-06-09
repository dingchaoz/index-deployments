import { MAY_MERKLE_DISTRIBUTION } from "@deployments/utils/deploys/rewards/007_may21Distribution";
import { parseBalanceMap } from "@deployments/utils";

import { DistributionFormat } from "@utils/types";

const distributionArray: DistributionFormat[] = MAY_MERKLE_DISTRIBUTION;

export const MERKLE_ROOT_OBJECT = parseBalanceMap(distributionArray); // Merkle root object

export const CONTRACT_NAMES = {
  INDEX_TOKEN: "IndexToken",
  REWARDS_MAY21_MERKLE_DISTRIBUTOR: "RewardsMay21MerkleDistributor",
  MERKLE_DISTRIBUTOR: "MerkleDistributor",
};
