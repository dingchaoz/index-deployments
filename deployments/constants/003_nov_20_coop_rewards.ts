import { NOVEMBER_MERKLE_DISTRIBUTION } from "@deployments/utils/deploys/rewards/nov20Distribution";
import { parseBalanceMap } from "@deployments/utils";

import { DistributionFormat } from "@utils/types";

const distributionArray: DistributionFormat[] = NOVEMBER_MERKLE_DISTRIBUTION;

export const MERKLE_ROOT_OBJECT = parseBalanceMap(distributionArray); // Merkle root object

export const CONTRACT_NAMES = {
  INDEX_TOKEN: "IndexToken",
  REWARDS_NOV20_MERKLE_DISTRIBUTOR: "RewardsNov20MerkleDistributor",
  MERKLE_DISTRIBUTOR: "MerkleDistributor",
};