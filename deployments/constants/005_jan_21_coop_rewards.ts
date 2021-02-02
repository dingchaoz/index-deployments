import { JANUARY_MERKLE_DISTRIBUTION } from "@deployments/utils/deploys/rewards/jan21Distribution";
import { parseBalanceMap } from "@deployments/utils";

import { DistributionFormat } from "@utils/types";

const distributionArray: DistributionFormat[] = JANUARY_MERKLE_DISTRIBUTION;

export const MERKLE_ROOT_OBJECT = parseBalanceMap(distributionArray); // Merkle root object

export const CONTRACT_NAMES = {
  INDEX_TOKEN: "IndexToken",
  REWARDS_JAN21_MERKLE_DISTRIBUTOR: "RewardsJan21MerkleDistributor",
  MERKLE_DISTRIBUTOR: "MerkleDistributor",
};