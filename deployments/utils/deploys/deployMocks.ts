import { Signer } from "ethers";
import { Address } from "../../../utils/types";
import { MutualUpgradeMock } from "../contracts/index";

import { MutualUpgradeMockFactory } from "@setprotocol/index-coop-contracts/dist/typechain/MutualUpgradeMockFactory";

export default class DeployMocks {
  private _deployerSigner: Signer;

  constructor(deployerSigner: Signer) {
    this._deployerSigner = deployerSigner;
  }

  public async deployMutualUpgradeMock(owner: Address, methodologist: string): Promise<MutualUpgradeMock> {
    return await new MutualUpgradeMockFactory(this._deployerSigner).deploy(owner, methodologist);
  }
}
