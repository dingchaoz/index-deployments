import "module-alias/register";

import { HardhatRuntimeEnvironment as HRE } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import {
  prepareDeployment,
  getCurrentStage,
  stageAlreadyFinished,
  trackFinishedStage,
  getContractAddress,
  saveContractDeployment,
  findDependency
} from "@deployments/utils";

import {
  CONTRACT_NAMES,
  VESTING_START,
  VESTING_CLIFF,
  VESTING_END,
  INVESTOR_DETAILS
} from "@deployments/constants/015_index_sale";

const CURRENT_STAGE = getCurrentStage(__filename);

const func: DeployFunction = trackFinishedStage(CURRENT_STAGE, async function (hre: HRE) {

  const { deploy, deployer } = await prepareDeployment(hre);

  const indexTokenAddress = await getContractAddress(CONTRACT_NAMES.INDEX_TOKEN);

  for (let i = 0; i < INVESTOR_DETAILS.length; i++) {

    const investor = INVESTOR_DETAILS[i];
    const checkOtcAddress = await getContractAddress(`${CONTRACT_NAMES.OTC_ESCROW} - ${investor.address}`);

    if (checkOtcAddress === "") {

      const indexGov = await findDependency("TREASURY_MULTI_SIG");
      const usdc = await findDependency("USDC");

      const constructorArgs: any[] = [
        investor.address,
        indexGov,
        VESTING_START,
        VESTING_CLIFF,
        VESTING_END,
        investor.usdcAmount,
        investor.indexAmount,
        usdc,
        indexTokenAddress,
      ];

      const escrow = await deploy(
        CONTRACT_NAMES.OTC_ESCROW,
        { from: deployer, args: constructorArgs, log: true }
      );

      escrow.receipt &&
        await saveContractDeployment({
          name: `${CONTRACT_NAMES.OTC_ESCROW} - ${investor.address}`,
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