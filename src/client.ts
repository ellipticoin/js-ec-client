import * as YAML from "yaml";
import * as _ from "lodash";
import * as queryString from "query-string";
import * as cbor from "borc";
import * as fetch from "node-fetch";
import * as fs from "fs";
import * as libsodium from "libsodium-wrappers-sumo";

import { DEFAULT_NETWORK_ID, ELIPITCOIN_SEED_EDGE_SERVERS } from "./constants";
import { base64url, objectHash, randomUnit32, toKey } from "./utils";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default class Client {
  public static fromConfig(configPath) {
    const privateKey = Buffer.from(
      YAML.parse(fs.readFileSync(configPath, "utf8")).privateKey,
      "base64",
    );

    return new this({
      privateKey,
    });
  }
  public privateKey: Buffer;
  public eventSource: EventSource;
  public networkId: number;
  public bootnodes: string[];

  constructor({
    privateKey,
    networkId = DEFAULT_NETWORK_ID,
    bootnodes = ELIPITCOIN_SEED_EDGE_SERVERS,
  }) {
    this.networkId = networkId;
    this.privateKey = privateKey;
    this.bootnodes = bootnodes;
    this.eventSource = new EventSource(this.edgeServer());
  }

  public edgeServer() {
    return _.sample(this.bootnodes);
  }

  public async sign(message) {
    await libsodium.ready;
    return libsodium.crypto_sign_detached(message, this.privateKey);
  }

  public addBlockListener(callback) {
    this.eventSource.addEventListener("block", (event: any) =>
      callback(event.data),
    );
  }

  public close() {
    this.eventSource.close();
  }

  public async publicKey() {
    await libsodium.ready;
    return Buffer.from(libsodium.crypto_sign_ed25519_sk_to_pk(this.privateKey));
  }

  public async deploy(contractName, contractCode, constructorParams) {
    return this.post({
      arguments: [contractName, contractCode, constructorParams],
      contract_address: Buffer.concat([
        Buffer.alloc(32),
        Buffer.from("System"),
      ]),
      function: "create_contract",
    });
  }

  public async post(transaction) {
    const body = {
      network_id: this.networkId,
      gas_limit: 100000000,
      nonce: await randomUnit32(),
      sender: Array.from(await this.publicKey()),
      ...transaction,
    };
    const signedBody = await cbor.encode({
      ...body,
      signature: Array.from(
        Buffer.from(await this.sign(await cbor.encode(body))),
      ),
    });

    const response = await fetch(this.edgeServer() + "/transactions", {
      body: signedBody,
      headers: {
        "Content-Type": "application/cbor",
      },
      redirect: "follow",
      method: "POST",
    });

    if (response.ok) {
      return cbor.decode(Buffer.from(await response.arrayBuffer()));
    } else {
      throw await response.text();
    }
  }

  public async getTransaction(transactionHash) {
    return fetch(
      this.edgeServer() + "/transactions/" + transactionHash,
    ).then(async (response) => {
      if (response.status === 404) {
        throw new Error("Transaction not found");
      } else {
        const arrayBuffer = await response.arrayBuffer();
        return cbor.decode(Buffer.from(arrayBuffer));
      }
    });
  }

  public async getBlocks(query) {
    console.log("blocks")
    return fetch(
      this.edgeServer() + "/blocks?" + queryString.stringify(query),
    ).then(async (response) => {
      if (response.status === 404) {
        throw new Error("Block not found");
      } else {
        const arrayBuffer = await response.arrayBuffer();
        return cbor.decode(Buffer.from(arrayBuffer));
      }
    });
  }

  public async getBlock(blockHash) {
    return fetch(
      this.edgeServer() + "/blocks/" + blockHash
    ).then(async (response) => {
      if (response.status === 404) {
        throw new Error("Block not found");
      } else {
        const arrayBuffer = await response.arrayBuffer();
        return cbor.decode(Buffer.from(arrayBuffer));
      }
    });
  }

  public async getMemory(contractAddress, contractName, key) {
    const fullKey = toKey(contractAddress, contractName, key);
    const response = await fetch(this.edgeServer() + "/memory/" + fullKey);
    const bytes = Buffer.from(await response.arrayBuffer());

    if (bytes.byteLength > 0) {
      return cbor.decode(bytes);
    }
  }

  public async getStorage(contractAddress, contractName, key) {
    const fullKey = toKey(contractAddress, contractName, key);
    const response = await fetch(this.edgeServer() + "/storage/" + fullKey);
    const bytes = Buffer.from(await response.arrayBuffer());

    if (bytes.byteLength > 0) {
      return cbor.decode(bytes);
    }
  }
}
