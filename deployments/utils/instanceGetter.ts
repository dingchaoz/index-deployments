import {
  BaseManager
} from "@setprotocol/index-coop-contracts/utils/contracts/index";

import { BaseManager__factory } from "@setprotocol/index-coop-contracts/dist/typechain/factories/BaseManager__factory";

import { Signer } from "ethers";

import { Address } from "../../utils/types";

export default class InstanceGetter {
  private _deployerSigner: Signer;

  constructor(deployerSigner: Signer) {
    this._deployerSigner = deployerSigner;
  }

  public async getBaseManager(icManagerV2Address: Address): Promise<BaseManager> {
    return await new BaseManager__factory(this._deployerSigner).attach(icManagerV2Address);
  }
}