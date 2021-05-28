import "module-alias/register";
import { deployments } from "hardhat";

import {
  addSnapshotBeforeRestoreAfterEach,
  getAccounts,
  getWaffleExpect,
} from "@utils/index";

import { Account } from "@utils/types";
import { DEPENDENCY, findDependency, getContractAddress } from "@deployments/utils";
import { IndexPowah } from "@set/typechain/IndexPowah";
import { IndexPowah__factory } from "@set/typechain/factories/IndexPowah__factory";
import { CONTRACT_NAMES } from "../../deployments/constants/016_index_powah";

const expect = getWaffleExpect();

const {
  TREASURY_MULTI_SIG,
  INDEX_ETH_UNISWAP,
  INDEX_ETH_SUSHISWAP,
} = DEPENDENCY;

describe("IndexPowah", () => {

  let deployer: Account;
  let indexPowah: IndexPowah;

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    await deployments.fixture();

    const deployedIndexPowah = await getContractAddress("IndexPowah");
    indexPowah = new IndexPowah__factory(deployer.wallet).attach(deployedIndexPowah);
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("#constructor", async () => {
    it("should set the correct state variables", async () => {
      expect(await indexPowah.owner()).to.eq(await findDependency(TREASURY_MULTI_SIG));
      expect(await indexPowah.indexToken()).to.eq(await findDependency(CONTRACT_NAMES.INDEX_TOKEN));
      expect(await indexPowah.uniPair()).to.eq(await findDependency(INDEX_ETH_UNISWAP));
      expect(await indexPowah.sushiPair()).to.eq(await findDependency(INDEX_ETH_SUSHISWAP));
      expect(await indexPowah.farms(0)).to.eq(await findDependency("StakingRewardsV2 - December"));
      expect(await indexPowah.farms(1)).to.eq(await findDependency("StakingRewardsV2 - MVI"));
    });
  });
});
