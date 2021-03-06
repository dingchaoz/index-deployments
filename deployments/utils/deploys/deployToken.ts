import "module-alias/register";

import { Signer } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";
import { Address } from "../../../utils/types";
import {
  IndexToken,
  MerkleDistributor,
  Vesting,
  IndexToken__factory,
  MerkleDistributor__factory,
  Vesting__factory
} from "@set/typechain/index";

export default class DeployToken {
  private _deployerSigner: Signer;

  constructor(deployerSigner: Signer) {
    this._deployerSigner = deployerSigner;
  }

  public async deployIndexToken(initialAccount: Address): Promise<IndexToken> {
    return await new IndexToken__factory(this._deployerSigner).deploy(initialAccount);
  }

  public async deployMerkleDistributor(token: Address, merkleRoot: string): Promise<MerkleDistributor> {
    return await new MerkleDistributor__factory(this._deployerSigner).deploy(token, merkleRoot);
  }

  public async deployVesting(
    token: Address,
    recipient: Address,
    vestingAmount: BigNumber,
    vestingBegin: BigNumber,
    vestingCliff: BigNumber,
    vestingEnd: BigNumber
  ): Promise<Vesting> {
    return await new Vesting__factory(this._deployerSigner).deploy(
      token,
      recipient,
      vestingAmount,
      vestingBegin,
      vestingCliff,
      vestingEnd
    );
  }
}
