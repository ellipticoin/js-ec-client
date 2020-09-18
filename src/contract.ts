import Client from "./client";

export default class Contract {
  constructor(
    public client: Client,
    public name: string,
  ) {
    this.client = client;
    this.name = name;
  }

  public setClient(client) {
    this.client = client;
  }

  public getMemory(key) {
    if (this.client) {
      return this.client.getMemory(this.name, key);
    }
  }

  public getStorage(key) {
    if (this.client) {
      return this.client.getStorage(this.name, key);
    }
  }

  public post(func, ...args) {
    if (this.client) {
      return this.client.post({
        arguments: args,
        contract: this.name,
        function: func,
      });
    }
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
}
