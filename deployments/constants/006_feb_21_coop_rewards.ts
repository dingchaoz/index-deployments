import { FEBRUARY_MERKLE_DISTRIBUTION } from "@deployments/utils/deploys/rewards/004_feb21Distribution";
import { parseBalanceMap } from "@deployments/utils";

import { DistributionFormat } from "@utils/types";

const distributionArray: DistributionFormat[] = FEBRUARY_MERKLE_DISTRIBUTION;

export const MERKLE_ROOT_OBJECT = parseBalanceMap(distributionArray); // Merkle root object

export const CONTRACT_NAMES = {
  INDEX_TOKEN: "IndexToken",
  REWARDS_FEB21_MERKLE_DISTRIBUTOR: "RewardsFeb21MerkleDistributor",
  MERKLE_DISTRIBUTOR: "MerkleDistributor",
};