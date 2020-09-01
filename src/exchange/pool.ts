import { SYSTEM_ADDRESS } from "../constants";
import Contract from "../contract";
import { addressToBuffer, encodeAddress, sha256 } from "../utils";
import Exchange from "./index";
const BASE_TOKEN_RESERVES_KEY = 2;

export default class Pool {
  public static async fetch(client, token) {
    const exchange = new Exchange(client);
    const properties = {};
    const baseTokenReserves = await exchange.getNamespacedMemory("baseTokenReserves", Buffer.concat([
                
                token.issuer.toBuffer(),
                Buffer.from(token.id),
]
));
    const reserves = await exchange.getNamespacedMemory("reserves", Buffer.concat([
                
                token.issuer.toBuffer(),
                Buffer.from(token.id),
]
));
        return new this(
                exchange,
                token,
                {
                    baseTokenReserves,
                    reserves,
                })
        }

    
  public token: any;
  public reserves: number;
  public baseTokenReserves: number;
  public balance: number;


  constructor(
    public exchange: Exchange,
    token,
    atributes) {
    this.token = token;
    Object.assign(this, atributes);
  }


  public exists() {
    return this.baseTokenReserves >  0
  }

  public create(amount, initalPrice) {
    return this.exchange.createPool(this.token, amount, initalPrice)
  }

  public addLiquidity(amount) {
    return this.exchange.addLiquidity(this.token, amount)
  }
}
