import "module-alias/register";

import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import {
  prepareDeployment,
  getCurrentStage,
  stageAlreadyFinished,
  trackFinishedStage,
  getContractAddress,
  saveContractDeployment
} from "@deployments/utils";

import {
    CONTRACT_NAMES,
    USDC,
    INDEX_GOV,
    VESTING_START,
    VESTING_CLIFF,
    VESTING_END,
    INVESTOR_DETAILS
} from "@deployments/constants/015_index_sale";

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (hre: HRE) {

  await prepareDeployment(hre);

  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const indexTokenAddress = await getContractAddress(CONTRACT_NAMES.INDEX_TOKEN);
  const checkOtcAddress = await getContractAddress(CONTRACT_NAMES.OTC_ESCROW);

  if (checkOtcAddress === "") {
    for (let i = 0; i < INVESTOR_DETAILS.length; i++) {

      const investor = INVESTOR_DETAILS[i];
      const constructorArgs: any[] = [
        investor.address,
        INDEX_GOV,
        VESTING_START,
        VESTING_CLIFF,
        VESTING_END,
        investor.usdcAmount,
        investor.indexAmount,
        USDC,
        indexTokenAddress,
      ];

      const escrow = await deploy(
        CONTRACT_NAMES.OTC_ESCROW,
        { from: deployer, args: constructorArgs, log: true }
      );

      escrow.receipt &&
        await saveContractDeployment({
            name: `${CONTRACT_NAMES.OTC_ESCROW} - ${i + 1}`,
            contractAddress: escrow.address,
            id: escrow.receipt.transactionHash,
            description: `Deployed ${CONTRACT_NAMES.OTC_ESCROW}`,
            constructorArgs,
        });
    }
  }
});

func.skip = stageAlreadyFinished(CURRENT_STAGE);

export default func;