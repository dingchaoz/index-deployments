import {
  ICManagerV2
} from "@setprotocol/index-coop-contracts/utils/contracts/index";

import { ICManagerV2__factory } from "@setprotocol/index-coop-contracts/dist/typechain/factories/ICManagerV2__factory";

import { Signer } from "ethers";

import { Address } from "../../utils/types";

export default class InstanceGetter {
  private _deployerSigner: Signer;

  constructor(deployerSigner: Signer) {
    this._deployerSigner = deployerSigner;
  }

  public async getICManagerV2(icManagerV2Address: Address): Promise<ICManagerV2> {
    return await new ICManagerV2__factory(this._deployerSigner).attach(icManagerV2Address);
  }
}