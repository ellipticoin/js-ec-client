import Contract from "./contract";
import { sha256, encodeAddress, addressToBuffer } from "./utils";
import { SYSTEM_ADDRESS } from "./constants";
import base64url from "base64url";
const BALANCE_KEY = 1;

export default class Token extends Contract {
  public issuer: [Buffer, string?];
  public tokenId: number[];

  constructor(client, issuer, tokenId) {
    super(client, SYSTEM_ADDRESS, "Token");
    this.issuer = issuer;
    this.tokenId = tokenId;
  }

  public async transfer(recipientAddress, amount) {
    const transaction = this.createTransaction(
      "transfer",
      [encodeAddress(this.issuer), this.tokenId],
      encodeAddress(recipientAddress),
      amount,
    );

    if (this.client) {
      return this.client.post(transaction);
    }
  }

  public async getBalance(address) {
    return (
      (await this.getMemory(
        Buffer.from([
          BALANCE_KEY,
          ...Array.from(addressToBuffer(this.issuer)),
          ...this.tokenId,
          ...address,
        ]),
      )) || 0
    );
  }

  issuerHash() {
    if (this.issuer.length === 2) {
        return Array.from(Buffer.concat([
          Buffer.from(this.issuer[0]),
          Buffer.from(this.issuer[1]),
        ]))
    } else {
      return Array.from(Buffer.from(this.issuer));
    }
  }

  encodeIssuer() {
    if (this.issuer.length === 1) {
      return {
        PublicKey: this.issuer,
      };
    } else {
      return {
        Contract: this.issuer,
      };
    }
  }
}
