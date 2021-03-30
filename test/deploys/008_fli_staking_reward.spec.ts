import "module-alias/register";
import { deployments } from "hardhat";

import { Account } from "@utils/types";
import {
  StakingRewardsV2,
  StakingRewardsV2__factory
  } from "@set/typechain/index";
import {
  addSnapshotBeforeRestoreAfterEach,
  getAccounts,
  getWaffleExpect,
} from "@utils/index";
import {
  findDependency,
  getContractAddress,
  ONE_DAY_IN_SECONDS,
} from "@deployments/utils";

const expect = getWaffleExpect();

describe("StakingRewardsV2 - ETHFLI", () => {
  let deployer: Account;

  let stakingRewards: StakingRewardsV2;

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    await deployments.fixture();

    const rewardsDeploy  = await getContractAddress("StakingRewardsV2 - ETHFLI");
    stakingRewards = new StakingRewardsV2__factory(deployer.wallet).attach(rewardsDeploy);
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("StakingRewardsV2 - ETHFLI", async () => {
    it("should have the correct rewards distributor", async () => {
      const distributor = await stakingRewards.rewardsDistribution();
      expect(distributor).to.eq(await findDependency("TREASURY_MULTI_SIG"));
    });

    it("should have the correct reward token", async () => {
      const rewardToken = await stakingRewards.rewardsToken();
      expect(rewardToken).to.eq(await findDependency("IndexToken"));
    });

    it("should have the correct staking token", async () => {
      const stakingToken = await stakingRewards.stakingToken();
      expect(stakingToken).to.eq(await findDependency("ETHFLI_UNI_POOL"));
    });

    it("should have the correct rewards duration", async () => {
      const duration = await stakingRewards.rewardsDuration();
      expect(duration).to.eq(ONE_DAY_IN_SECONDS.mul(30));
    });
  });
});