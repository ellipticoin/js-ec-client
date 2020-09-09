import * as _ from "lodash";
import { SYSTEM_ADDRESS } from "../constants";
import Contract from "../contract";
import Token from "../token";
import { addressToBuffer, encodeAddress, sha256 } from "../utils";
import Exchange from "./index";
const BASE_TOKEN_RESERVES_KEY = 2;

export default class Pool {
  public static async fetch(client, token) {
    const exchange = new Exchange(client);
    const properties = {};
    const baseTokenReserves = await exchange.getNamespacedMemory(
      "baseTokenReserves",
      Buffer.concat([token.issuer.toBuffer(), Buffer.from(token.id)]),
    );
    const reserves = await exchange.getNamespacedMemory(
      "reserves",
      Buffer.concat([token.issuer.toBuffer(), Buffer.from(token.id)]),
    );
    const issuanceReserves = await exchange.getNamespacedMemory(
      "issuanceReserves",
      Buffer.concat([token.issuer.toBuffer(), Buffer.from(token.id)]),
    );

    const poolToken = new Token(
      client,
      Exchange.ADDRESS,
      sha256(Buffer.concat([token.issuer.toBuffer(), Buffer.from(token.id)])),
    );

    return new this(exchange, token, {
      baseTokenReserves,
      issuanceReserves,
      poolToken,
      reserves,
    });
  }

  public token: any;
  public poolToken: any;
  public reserves: number;
  public issuanceReserves: number;
  public baseTokenReserves: number;
  public balance: number;

  constructor(public exchange: Exchange, token, atributes) {
    this.token = token;
    Object.assign(this, atributes);
  }

  public exists() {
    return this.baseTokenReserves > 0;
  }

  public price() {
    if (
      _.isEqual(
        this.token.id,
        ethTokenId("4748b2e6DB310512Ff9085E533b6C4151ff10746"),
      )
    ) {
      return 1;
    } else {

        // console.log("vv")
        // console.log(this.reserves)
        // console.log(this.baseTokenReserves)
        // console.log("^^")
      return this.baseTokenReserves / this.reserves || 0;
    }
  }

  public issuancePerShare() {
    return this.issuanceReserves / this.reserves || 0;
  }

  public async getBalance(address) {
    return this.poolToken.getBalance(address);
  }

  public create(amount, initalPrice) {
    return this.exchange.createPool(this.token, amount, initalPrice);
  }

  public addLiquidity(amount) {
    return this.exchange.addLiquidity(this.token, amount);
  }

  public takeProfits() {
    return this.exchange.takeProfits(this.token);
  }
}

export function padBuffer(buffer, len) {
  return Buffer.concat([
    buffer,
    Buffer.from(Array(len - buffer.length).fill(0)),
  ]);
}

export function ethTokenId(address) {
  return Array.from(padBuffer(Buffer.from(address, "hex"), 32));
}
