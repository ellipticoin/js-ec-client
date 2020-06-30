import Client from "./client";

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
      arguments: args,
      contract_address: Buffer.concat([
        this.contractAddress,
        Buffer.from(this.contractName, "utf8"),
      ]),
      function: func,
    };
  }

  public post(transaction) {
    if (this.client) {
      return this.client.post(transaction);
    }
  }
}
