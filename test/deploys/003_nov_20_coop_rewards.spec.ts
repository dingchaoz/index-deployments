import "module-alias/register";
import { deployments } from "@nomiclabs/buidler";

import { Account } from "@utils/types";
import { MerkleDistributor } from "@deployments/utils/contracts/index";
import {
  addSnapshotBeforeRestoreAfterEach,
  getAccounts,
  getWaffleExpect,
} from "@utils/index";
import {
  getContractAddress,
} from "@deployments/utils/deploys/outputHelper";
import { NOVEMBER_MERKLE_DISTRIBUTION } from "@deployments/utils/deploys/rewards/nov20Distribution";

import { MerkleDistributorFactory } from "@setprotocol/index-coop-contracts/dist/typechain/MerkleDistributorFactory";

const expect = getWaffleExpect();

describe("RewardsNov20MerkleDistributor", () => {
  let deployer: Account;

  let distributorContractInstance: MerkleDistributor;

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    await deployments.fixture();

    const deployedMerkleDistributorContract = await getContractAddress("RewardsNov20MerkleDistributor");
    distributorContractInstance = new MerkleDistributorFactory(deployer.wallet).attach(deployedMerkleDistributorContract);
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("RewardsNov20MerkleDistributor", async () => {
    it("should have the correct token address", async () => {
      const indexToken = await distributorContractInstance.token();
      expect(indexToken).to.eq(await getContractAddress("IndexToken"));
    });

    it("should have the correct unclaimed", async () => {
      for (let rootIndex = 0; rootIndex < NOVEMBER_MERKLE_DISTRIBUTION.length; rootIndex++) {
        const isClaimed = await distributorContractInstance.isClaimed(rootIndex);
        expect(isClaimed).to.eq(false);
      }
    });
  });
});