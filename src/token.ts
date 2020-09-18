import { addressToBuffer, encodeAddress, sha256 } from "./helpers";

import base64url from "base64url";
import { SYSTEM_ADDRESS } from "./constants";
import Contract from "./contract";


export default class Token extends Contract {
  public static memoryNamespace: string[] = [
    "balance",
    "totalSupply",
  ];
  public issuer: any;
  public tokenId: number[];

  constructor(client, issuer, tokenId) {
    super(client, "Token");
    this.issuer = issuer;
    this.tokenId = tokenId;
  }

  public async transfer(recipientAddress, amount) {
    return this.post(
      "transfer",
      [encodeAddress(this.issuer), this.tokenId],
      recipientAddress,
      amount,
    );
  }

  public async getTotalSupply() {
    return (
      (await this.getNamespacedMemory(
        "totalSupply",
        Buffer.concat([
          Buffer.from(this.issuer, "utf8"),
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
          Buffer.from(this.issuer, "utf8"),
          Buffer.from(this.tokenId),
          Buffer.from(address),
        ]),
      )) || 0
    );
  }
}
