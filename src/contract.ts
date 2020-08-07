import Client from "./client";

export default class Contract {
  public client: Client;
  public legislator: Buffer;
  public name: string;

  constructor(client, legislator, name) {
    this.client = client;
    this.legislator = legislator;
    this.name = name;
  }

  public setClient(client) {
    this.client = client;
  }

  public getMemory(key) {
    if (this.client) {
      return this.client.getMemory(
        this.legislator,
        this.name,
        key,
      );
    }
  }

  public getStorage(key) {
    if (this.client) {
      return this.client.getStorage(
        this.legislator,
        this.name,
        key,
      );
    }
  }

  public createTransaction(func, ...args) {
    return {
      arguments: args,
      contract_address: [this.legislator, this.name],
      function: func,
    };
  }

  public post(transaction) {
    if (this.client) {
      return this.client.post(transaction);
    }
  }
}
