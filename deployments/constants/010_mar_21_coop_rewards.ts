import { MARCH_MERKLE_DISTRIBUTION } from "@deployments/utils/deploys/rewards/005_mar21Distribution.ts";
import { parseBalanceMap } from "@deployments/utils";

import { DistributionFormat } from "@utils/types";

const distributionArray: DistributionFormat[] = MARCH_MERKLE_DISTRIBUTION;

export const MERKLE_ROOT_OBJECT = parseBalanceMap(distributionArray); // Merkle root object

export const CONTRACT_NAMES = {
  INDEX_TOKEN: "IndexToken",
  REWARDS_MAR21_MERKLE_DISTRIBUTOR: "RewardsMar21MerkleDistributor",
  MERKLE_DISTRIBUTOR: "MerkleDistributor",
};