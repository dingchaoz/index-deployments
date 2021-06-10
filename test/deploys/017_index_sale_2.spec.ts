import "module-alias/register";
import { deployments } from "hardhat";

import { addSnapshotBeforeRestoreAfterEach, getAccounts, getWaffleExpect } from "@utils/index";

import { Account } from "@utils/types";
import { OtcEscrow } from "@set/typechain/OtcEscrow";
import { findDependency, getContractAddress } from "@deployments/utils";
import { OtcEscrow__factory } from "@set/typechain/factories/OtcEscrow__factory";
import {
  INVESTOR_DETAILS,
  VESTING_CLIFF,
  VESTING_END,
  VESTING_START,
} from "@deployments/constants/017_index_sale_2";

const expect = getWaffleExpect();

describe("OtcEscrow", () => {
  let deployer: Account;
  let otcEscrow: OtcEscrow;

  before(async () => {
    [deployer] = await getAccounts();

    await deployments.fixture();

    const deployedOtcEscrow = await getContractAddress(
      "OtcEscrow - " + INVESTOR_DETAILS[0].address,
    );
    otcEscrow = new OtcEscrow__factory(deployer.wallet).attach(deployedOtcEscrow);
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("#constructor", async () => {
    it("should set the correct state variables", async () => {
      expect(await otcEscrow.beneficiary()).to.eq(INVESTOR_DETAILS[0].address);
      expect(await otcEscrow.indexGov()).to.eq(deployer.address);
      expect(await otcEscrow.vestingStart()).to.eq(VESTING_START);
      expect(await otcEscrow.vestingCliff()).to.eq(VESTING_CLIFF);
      expect(await otcEscrow.vestingEnd()).to.eq(VESTING_END);
      expect(await otcEscrow.usdcAmount()).to.eq(INVESTOR_DETAILS[0].usdcAmount);
      expect(await otcEscrow.indexAmount()).to.eq(INVESTOR_DETAILS[0].indexAmount);
      expect(await otcEscrow.usdc()).to.eq(await findDependency("USDC"));
    });
  });
});
