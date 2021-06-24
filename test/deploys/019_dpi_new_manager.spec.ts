import "module-alias/register";
import { deployments } from "hardhat";

import { Account } from "@utils/types";

import { BaseManager } from "@set/typechain/BaseManager";
import { BaseManager__factory } from "@set/typechain/factories/BaseManager__factory";
import { GovernanceAdapter } from "@set/typechain/GovernanceAdapter";
import { GovernanceAdapter__factory } from "@set/typechain/factories/GovernanceAdapter__factory";

import {
  addSnapshotBeforeRestoreAfterEach,
  getAccounts,
  getWaffleExpect,
} from "@utils/index";
import {
  findDependency,
  getContractAddress,
  DEPENDENCY
} from "@deployments/utils";

const {
  GOVERNANCE_MODULE,
} = DEPENDENCY;


const expect = getWaffleExpect();

describe("DPI: New Manager System", () => {
  let deployer: Account;

  let baseManagerInstance: BaseManager;
  let governanceAdapterInstance: GovernanceAdapter;

  before(async () => {
    [
      deployer,
    ] = await getAccounts();

    await deployments.fixture();

    const deployedBaseManagerContract = await getContractAddress("BaseManager - DPI");
    baseManagerInstance = new BaseManager__factory(deployer.wallet).attach(deployedBaseManagerContract);

    const deployedGovernanceAdapter = await getContractAddress("GovernanceAdapter - DPI");
    governanceAdapterInstance = new GovernanceAdapter__factory(deployer.wallet).attach(deployedGovernanceAdapter);
  });

  addSnapshotBeforeRestoreAfterEach();

  describe("BaseManager", async () => {
    it("should have the correct SetToken address", async () => {
      const setToken = await baseManagerInstance.setToken();

      expect(setToken).to.eq(await findDependency("DPI"));
    });

    it("should have the correct operator address", async () => {
      const operator = await baseManagerInstance.operator();
      expect(operator).to.eq(deployer.address);
    });

    it("should have the correct methodologist address", async () => {
      const methodologist = await baseManagerInstance.methodologist();
      expect(methodologist).to.eq(deployer.address);
    });

    it("should have the correct adapters", async () => {
      const adapters = await baseManagerInstance.getAdapters();
      expect(adapters[0]).to.eq(governanceAdapterInstance.address);
    });
  });

  describe("GovernanceAdapter", async () => {
    it("should have the correct manager address", async () => {
      const manager = await governanceAdapterInstance.manager();
      expect(manager).to.eq(await getContractAddress("BaseManager - DPI"));
    });

    it("should have the correct GovernanceModule address", async () => {
      const govModule = await governanceAdapterInstance.governanceModule();
      expect(govModule).to.eq(await findDependency(GOVERNANCE_MODULE));
    });
  });
});