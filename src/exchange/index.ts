import * as cbor from "borc";
import Address from "../address";
import Client from "../client";
import { SYSTEM_ADDRESS } from "../constants";
import Contract from "../contract";
import { encodeAddress, padBuffer } from "../helpers";

export default class Exchange extends Contract {
  public static ADDRESS: Address = Address.newContract(
    SYSTEM_ADDRESS,
    "Exchange",
  );
  public static memoryNamespace: string[] = [
    "baseTokenReserves",
    "reserves",
    "issuanceReserves",
  ];
  public static ethTokenId(address) {
    return Array.from(padBuffer(Buffer.from(address, "hex"), 32));
  }
  constructor(public client: Client) {
    super(client, SYSTEM_ADDRESS, "Exchange");
  }

  public async createPool(token, amount, initalPrice) {
    return this.post(
      "create_pool",
      [token.issuer.toObject(), Array.from(token.id)],
      amount,
      initalPrice,
    );
  }

  public async swap(inputToken, outputToken, amount) {
    return this.post(
      "swap",
      [inputToken.issuer.toObject(), Array.from(inputToken.id)],
      [outputToken.issuer.toObject(), Array.from(outputToken.id)],
      amount,
    );
  }

  public async addLiquidity(token, amount) {
    return this.post(
      "add_liqidity",
      [token.issuer.toObject(), Array.from(token.id)],
      amount,
    );
  }

  public async takeProfits(token) {
    return this.post("take_profits", [
      token.issuer.toObject(),
      Array.from(token.id),
    ]);
  }

  public getNamespacedMemory(memoryNamespace, key) {
    return this.getMemory(
      Buffer.concat([
        Buffer.from([Exchange.memoryNamespace.indexOf(memoryNamespace)]),
        key,
      ]),
    );
  }
}
