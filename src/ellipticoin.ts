import { addressToBuffer, encodeAddress, sha256 } from "./helpers";

import Contract from "./contract";
import { SYSTEM_ADDRESS } from "./constants";
import base64url from "base64url";

export default class Ellipticoin extends Contract {
  public static memoryNamespace: string[] = ["issuanceRewards"];
  constructor(client, issuer, tokenId) {
    super(client, "Ellipticoin");
  }

  public async getIssuanceRewards(address) {
    return (
      (await this.getNamespacedMemory(
        "issuanceRewards",
        Buffer.from(address),
      )) || 0
    );
  }

  public async harvest(recipientAddress, amount) {
    return this.post("harvest");
  }
}
