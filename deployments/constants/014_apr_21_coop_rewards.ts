import { APRIL_MERKLE_DISTRIBUTION } from "@deployments/utils/deploys/rewards/006_apr21Distribution";
import { parseBalanceMap } from "@deployments/utils";

import { DistributionFormat } from "@utils/types";

const distributionArray: DistributionFormat[] = APRIL_MERKLE_DISTRIBUTION;

export const MERKLE_ROOT_OBJECT = parseBalanceMap(distributionArray); // Merkle root object

export const CONTRACT_NAMES = {
  INDEX_TOKEN: "IndexToken",
  REWARDS_APR21_MERKLE_DISTRIBUTOR: "RewardsApr21MerkleDistributor",
  MERKLE_DISTRIBUTOR: "MerkleDistributor",
};
