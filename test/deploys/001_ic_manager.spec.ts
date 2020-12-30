import "module-alias/register";
import { deployments } from "@nomiclabs/buidler";

import { Account } from "@utils/types";
import { IcManager } from "@deployments/utils/contracts/index";
import {
  addSnapshotBeforeRestoreAfterEach,
  getAccounts,
  getWaffleExpect,
} from "@utils/index";
import {
  findDependency,
  getContractAddress,
} from "@deployments/utils/deploys/outputHelper";

import { IC_MANAGER } from "@deployments/constants/001_ic_manager";
import { IcManagerFactory } from "@setprotocol/index-coop-contracts/dist/typechain/IcManagerFactory";

const expect = getWaffleExpect();

describe("ICManager", () => {
  let deployer: Account;

  let manager: IcManager;

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    await deployments.fixture();

    const icManagerDeploy  = await getContractAddress("ICManager");
    manager = new IcManagerFactory(deployer.wallet).attach(icManagerDeploy);
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("ICManager", async () => {
    it("should have the correct dpi address", async () => {
      const dpi = await manager.setToken();
      expect(dpi).to.eq(await findDependency("DPI"));
    });

    it("should have the correct index module", async () => {
      const indexModule = await manager.indexModule();
      expect(indexModule).to.eq(await findDependency("SINGLE_INDEX_MODULE"));
    });

    it("should have the correct streaming fee module", async () => {
      const feeModule = await manager.feeModule();
      expect(feeModule).to.eq(await findDependency("STREAMING_FEE_MODULE"));
    });

    it("should have the correct operator address", async () => {
      const operator = await manager.operator();
      expect(operator).to.eq(await findDependency("TREASURY_MULTI_SIG"));
    });

    it("should have the correct methodologist address", async () => {
      const methodologist = await manager.methodologist();
      expect(methodologist).to.eq(await findDependency("DFP_MULTI_SIG"));
    });

    it("should have the correct operator fee split", async () => {
      const feeSplit = await manager.operatorFeeSplit();
      expect(feeSplit).to.eq(IC_MANAGER.FEE_SPLIT);
    });
  });
});