import Client from "../client";
import {SYSTEM_ADDRESS} from "../constants";
import Contract from "../contract";
import {encodeAddress} from "../utils";
import * as cbor from "borc";

export default class Exchange extends Contract {
    public static memoryNamespace: string[] = [
        "balance",
        "baseTokenReserves",
        "reserves",
    ];
    constructor(
        public client: Client,
    ) {
        super(client, SYSTEM_ADDRESS, "Exchange")
    }

  public async createPool(token, amount, initalPrice) {
    const transaction = this.createTransaction(
      "create_pool",
      [token.issuer.toObject(), Array.from(token.id)],
      amount,
      initalPrice,
    );

    if (this.client) {
      return this.client.post(transaction);
    }
  }

  public async swap(inputToken, outputToken, amount) {
    const transaction = this.createTransaction(
      "swap",
      [inputToken.issuer.toObject(), Array.from(inputToken.id)],
      [outputToken.issuer.toObject(), Array.from(outputToken.id)],
      amount,
    );

    if (this.client) {
      return this.client.post(transaction);
    }
  }

  public async addLiquidity(token, amount) {
    const transaction = this.createTransaction(
      "add_liqidity",
      [token.issuer.toObject(), Array.from(token.id)],
      amount,
    );

    if (this.client) {
      return this.client.post(transaction);
    }
  }

    public getNamespacedMemory(memoryNamespace, key) {
        return this.getMemory(
Buffer.concat([
            Buffer.from([Exchange.memoryNamespace.indexOf(memoryNamespace)]),
            key
        ])
)
    }
}
