import { addressToBuffer, encodeAddress, sha256 } from "./helpers";

import base64url from "base64url";
import { SYSTEM_ADDRESS } from "./constants";
import Contract from "./contract";


export default class Bridge extends Contract {
  public issuer: any;
  public tokenId: number[];

  constructor(client, issuer, tokenId) {
    super(client, SYSTEM_ADDRESS, "Bridge");
    this.issuer = issuer;
    this.tokenId = tokenId;
  }

  public async release(recipientAddress, amount) {
    return this.post(
      "release",
      this.tokenId,
      Array.from(recipientAddress),
      amount,
    );
  }

  public toObject() {
    return [this.issuer.toObject(), this.tokenId];
  }

  public async getTotalSupply() {
    return (
      (await this.getNamespacedMemory(
        "totalSupply",
        Buffer.concat([
          addressToBuffer(this.issuer),
          Buffer.from(this.tokenId),
        ]),
      )) || 0
    );
  }

  public async getBalance(address) {
    return (
      (await this.getNamespacedMemory(
        "balance",
        Buffer.concat([
          addressToBuffer(this.issuer),
          Buffer.from(this.tokenId),
          Buffer.from(address),
        ]),
      )) || 0
    );
  }
}
