import "module-alias/register";

import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import {
  getRandomAddress,
} from "@utils/index";

import {
  addAdapter,
  DEPENDENCY,
  deployBaseManager,
  deployGovernanceAdapter,
  EMPTY_BYTES,
  findDependency,
  getCurrentStage,
  prepareDeployment,
  stageAlreadyFinished,
  trackFinishedStage,
  writeContractAndTransactionToOutputs,
} from "@deployments/utils";
import {
  CONTRACT_NAMES,
} from "@deployments/constants/019_dpi_new_manager";

const {
  DFP_MULTI_SIG,
  DPI,
  GOVERNANCE_MODULE,
} = DEPENDENCY;

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (hre: HRE) {
  const {
    deployer,
    networkConstant,
  } = await prepareDeployment(hre);

  let dfpMultisigAddress: string;
  if (networkConstant === "production") {
    dfpMultisigAddress = await findDependency(DFP_MULTI_SIG);
  } else {
    dfpMultisigAddress = deployer;
  }

  await polyFillForDevelopment();

  await deployBaseManager(hre, CONTRACT_NAMES.BASE_MANAGER_NAME, DPI, deployer, dfpMultisigAddress);

  await deployGovernanceAdapter(hre, CONTRACT_NAMES.GOVERNANCE_ADAPTER_NAME, CONTRACT_NAMES.BASE_MANAGER_NAME);

  await addAdapter(hre, CONTRACT_NAMES.BASE_MANAGER_NAME, CONTRACT_NAMES.GOVERNANCE_ADAPTER_NAME);

  async function polyFillForDevelopment(): Promise<void> {
    if (await findDependency(DPI) === "") {
      await writeContractAndTransactionToOutputs(DPI, await getRandomAddress(), EMPTY_BYTES, "Created Mock DPI");
    }

    if (await findDependency(GOVERNANCE_MODULE) === "") {
      await writeContractAndTransactionToOutputs(GOVERNANCE_MODULE, await getRandomAddress(), EMPTY_BYTES, "Created Mock GovernanceModule");
    }
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;