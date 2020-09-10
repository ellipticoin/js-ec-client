import { addressToBuffer, encodeAddress, sha256 } from "./utils";

import base64url from "base64url";
import { SYSTEM_ADDRESS } from "./constants";
import Contract from "./contract";

export default class Ellipticoin extends Contract {
  public static memoryNamespace: string[] = [
    "issuanceRewards",
  ];
  constructor(client, issuer, tokenId) {
    super(client, SYSTEM_ADDRESS, "Ellipticoin");
  }

  public async getIssuanceRewards(address) {
    return (
      (await this.getNamespacedMemory(
        "issuanceRewards",
        Buffer.from(address)
      )) || 0
    );
  }

  public async harvest(recipientAddress, amount) {
    console.log("harvest")
    const transaction = this.createTransaction(
      "harvest",
    );

    if (this.client) {
      return this.client.post(transaction);
    }
  }
}
