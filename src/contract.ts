import Client from "./client";

export default class Contract {
  constructor(
    public client: Client,
    public legislator: Buffer,
    public name: string,
  ) {
    this.client = client;
    this.legislator = legislator;
    this.name = name;
  }

  public setClient(client) {
    this.client = client;
  }

  public getMemory(key) {
    if (this.client) {
      return this.client.getMemory(this.legislator, this.name, key);
    }
  }

  public getStorage(key) {
    if (this.client) {
      return this.client.getStorage(this.legislator, this.name, key);
    }
  }

  public createTransaction(func, ...args) {
    return {
      arguments: args,
      contract_address: [Array.from(this.legislator), this.name],
      function: func,
    };
  }

  public async getNamespacedMemory(memoryNamespace, key = new Buffer([])) {
    return await this.getMemory(
      Buffer.concat([
        Buffer.from([
          (this.constructor as any).memoryNamespace.indexOf(memoryNamespace),
        ]),
        key,
      ]),
    );
  }

  public post(transaction) {
    if (this.client) {
      return this.client.post(transaction);
    }
  }
}
