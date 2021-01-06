import "module-alias/register";
import { BigNumber } from "@ethersproject/bignumber";

import { Address, Account } from "@utils/types";
import {} from "@utils/index";
import {} from "@utils/contracts";
import DeployHelper from "@utils/deploys";
import {
  addSnapshotBeforeRestoreAfterEach,
  getAccounts,
  getSystemFixture,
  getWaffleExpect,
} from "@utils/index";

const expect = getWaffleExpect();

describe("SPEC TITLE", () => {
  let owner: Account;
  let deployer: DeployHelper;

  before(async () => {
    [
      owner,
    ] = await getAccounts();

    deployer = new DeployHelper(owner.wallet);
    setup = getSystemFixture(owner.address);
    await setup.initialize();
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("#FUNCTION_NAME", async () => {
    let subjectArgument: Address;

    beforeEach(async () => {
    });

    async function subject(): Promise<any> {
    }

    it("should do something", async () => {
    });
  });
});
