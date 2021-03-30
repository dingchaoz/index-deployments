import "module-alias/register";
import { deployments } from "hardhat";

import { Account } from "@utils/types";
import {
  MerkleDistributor,
  MerkleDistributor__factory
} from "@set/typechain/index";
import {
  addSnapshotBeforeRestoreAfterEach,
  getAccounts,
  getWaffleExpect,
} from "@utils/index";
import {
  getContractAddress,
  JANUARY_MERKLE_DISTRIBUTION,
} from "@deployments/utils";

const expect = getWaffleExpect();

describe("RewardsJan21MerkleDistributor", () => {
  let deployer: Account;

  let distributorContractInstance: MerkleDistributor;

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    await deployments.fixture();

    const deployedMerkleDistributorContract = await getContractAddress("RewardsJan21MerkleDistributor");
    distributorContractInstance = new MerkleDistributor__factory(deployer.wallet).attach(deployedMerkleDistributorContract);
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("RewardsJan21MerkleDistributor", async () => {
    it("should have the correct token address", async () => {
      const indexToken = await distributorContractInstance.token();
      expect(indexToken).to.eq(await getContractAddress("IndexToken"));
    });

    it("should have the correct unclaimed", async () => {
      for (let rootIndex = 0; rootIndex < JANUARY_MERKLE_DISTRIBUTION.length; rootIndex++) {
        const isClaimed = await distributorContractInstance.isClaimed(rootIndex);
        expect(isClaimed).to.eq(false);
      }
    });
  });
});