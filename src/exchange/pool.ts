import * as _ from "lodash";
import Contract from "../contract";
import { addressToBuffer, encodeAddress, sha256 } from "../helpers";
import Token from "../token";
import Exchange from "./index";

export default class Pool {
  public static async fetch(client, token) {
    const exchange = new Exchange(client);
    const properties = {};
    const baseTokenReserves = await exchange.getNamespacedMemory(
      "baseTokenReserves",
      Buffer.concat([Buffer.from(token.issuer, "utf8"), Buffer.from(token.id)]),
    );
    const reserves = await exchange.getNamespacedMemory(
      "reserves",
      Buffer.concat([Buffer.from(token.issuer, "utf8"), Buffer.from(token.id)]),
    );
    const issuanceReserves = await exchange.getNamespacedMemory(
      "issuanceReserves",
      Buffer.concat([Buffer.from(token.issuer, "utf8"), Buffer.from(token.id)]),
    );

    const poolToken = new Token(
      client,
      "Exchange",
      sha256(Buffer.concat([Buffer.from(token.issuer, "utf8"), Buffer.from(token.id)])),
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
        Exchange.ethTokenId("6b175474e89094c44da98b954eedeac495271d0f"),
      )
    ) {
      return 1;
    } else {
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

  public removeLiquidity(amount) {
    return this.exchange.removeLiquidity(this.token, amount);
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
