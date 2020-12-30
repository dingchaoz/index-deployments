import "module-alias/register";
import { deployments } from "@nomiclabs/buidler";

import { Account } from "@utils/types";
import { StakingRewardsV2 } from "@deployments/utils/contracts/index";
import {
  addSnapshotBeforeRestoreAfterEach,
  getAccounts,
  getWaffleExpect,
} from "@utils/index";
import {
  findDependency,
  getContractAddress,
} from "@deployments/utils/deploys/outputHelper";

import { StakingRewardsV2Factory } from "@setprotocol/index-coop-contracts/dist/typechain/StakingRewardsV2Factory";
import { ONE_DAY_IN_SECONDS } from "@deployments/utils/constants";

const expect = getWaffleExpect();

describe("StakingRewardsV2 - December", () => {
  let deployer: Account;

  let stakingRewards: StakingRewardsV2;

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    await deployments.fixture();

    const rewardsDeploy  = await getContractAddress("StakingRewardsV2 - December");
    stakingRewards = new StakingRewardsV2Factory(deployer.wallet).attach(rewardsDeploy);
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("StakingRewardsV2 - December", async () => {
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
      expect(stakingToken).to.eq(await findDependency("DPI_ETH_UNI_POOL"));
    });

    it("should have the correct rewards duration", async () => {
      const duration = await stakingRewards.rewardsDuration();
      expect(duration).to.eq(ONE_DAY_IN_SECONDS.mul(30));
    });
  });
});