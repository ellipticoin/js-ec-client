import * as cbor from "borc";
import * as fs from "fs";
import yaml from "js-yaml";
import * as libsodium from "libsodium-wrappers-sumo";
import * as _ from "lodash";
import fetch from "node-fetch";
import { DEFAULT_NETWORK_ID, ELIPITCOIN_SEED_EDGE_SERVERS } from "./constants";
import {
  base64url,
  objectHash,
  randomUnit32,
  toKey,
} from "./utils";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default class Client {
  public static fromConfig(configPath) {
    const privateKey = Buffer.from(
      yaml.safeLoad(fs.readFileSync(configPath)).privateKey,
      "base64",
    );

    return new this({
      privateKey,
    });
  }
  public privateKey: Buffer;
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
  }

  public edgeServer() {
    // Once we go live we'll ask the seed servers for their peers
    // and call a list of edge nodes round-robin.
    // For now just send transactions directly to the seed nodes

    return _.sample(this.bootnodes);
  }

  public async sign(message) {
    await libsodium.ready;
    return libsodium.crypto_sign_detached(message, this.privateKey);
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
      sender: await this.publicKey(),
      ...transaction,
    };
    const signedBody = await cbor.encode({
      ...body,
      signature: Buffer.from(await this.sign(await cbor.encode(body))),
    });

    const response = await fetch(this.edgeServer() + "/transactions", {
      body: signedBody,
      headers: {
        "Content-Type": "application/cbor",
      },
      redirect: 'follow',
      method: "POST",
    });

    if (response.ok) {
      return cbor.decode(Buffer.from(await response.arrayBuffer()));
    } else {
      throw await response.text();
    }
  }

  public async waitForTransactionToBeMined(transaction, tries = 600) {
    const transactionHash = objectHash(transaction);
    try {
      return await this.getTransaction(transactionHash);
    } catch (err) {
      if (tries === 1) {
        throw new Error("Transaction too too long to be mined");
      }
      await sleep(500);
      return await this.waitForTransactionToBeMined(transaction, tries - 1);
    }
  }

  public async getTransaction(transactionHash) {
    return fetch(
      this.edgeServer() + "/transactions/" + base64url(transactionHash),
    ).then(async (response) => {
      if (response.status === 404) {
        throw new Error("Transaction not found");
      } else {
        const arrayBuffer = await response.arrayBuffer();
        return cbor.decode(Buffer.from(arrayBuffer));
      }
    });
  }

  public async getMemory(contractAddress, contractName, key) {
    const fullKey = toKey(contractAddress, contractName, key);
    const response = await fetch(
      this.edgeServer() + "/memory/" + fullKey,
    );
    return cbor.decode(Buffer.from(await response.arrayBuffer()));
  }

  public async getStorage(contractAddress, contractName, key) {
    const fullKey = toKey(contractAddress, contractName, key);
    const response = await fetch(
      this.edgeServer() + "/storage/" + fullKey,
    );
    return cbor.decode(Buffer.from(await response.arrayBuffer()));
  }
}
