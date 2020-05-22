import Client from "./client";
import {
  BASE_CONTRACT_ADDRESS,
  CONFIG_PATH,
  ELIPITCOIN_SEED_EDGE_SERVERS,
  TOKEN_CONTRACT_NAME,
} from "./constants";
const _ = require("lodash");

export default class Contract {
  public client?: Client;
  public contractAddress: Buffer;
  public contractName: string;

  constructor(contractAddress, contractName) {
    this.contractAddress = contractAddress;
    this.contractName = contractName;
  }

  public setClient(client) {
    this.client = client;
  }

  public getMemory(key) {
    if (this.client) {
      return this.client.getMemory(
        this.contractAddress,
        this.contractName,
        key,
      );
    }
  }

  public getStorage(key) {
    if (this.client) {
      return this.client.getStorage(
        this.contractAddress,
        this.contractName,
        key,
      );
    }
  }

  public createTransaction(func, ...args) {
    return {
      contract_address: Buffer.concat([
        this.contractAddress,
        Buffer.from(this.contractName, "utf8"),
      ]),
      function: func,
      arguments: args,
    };
  }

  public post(transaction) {
    if (this.client) {
      return this.client.post(transaction);
    }
  }
}
