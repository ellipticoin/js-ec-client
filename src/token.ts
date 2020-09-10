import { addressToBuffer, encodeAddress, sha256 } from "./helpers";

import base64url from "base64url";
import { SYSTEM_ADDRESS } from "./constants";
import Contract from "./contract";


export default class Token extends Contract {
  public static memoryNamespace: string[] = [
    "allowance",
    "balance",
    "totalSupply",
  ];
  public issuer: any;
  public tokenId: number[];

  constructor(client, issuer, tokenId) {
    super(client, SYSTEM_ADDRESS, "Token");
    this.issuer = issuer;
    this.tokenId = tokenId;
  }

  public async transfer(recipientAddress, amount) {
    return this.post(
      "transfer",
      this.toObject(),
      encodeAddress(recipientAddress),
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
