import { CONFIG_PATH, ELIPITCOIN_SEED_EDGE_SERVERS } from "./constants";
import {
  randomUnit32,
  base64url,
  fromBytesInt32,
  humanReadableAddressToU32Bytes,
  objectHash,
  toBytesInt32,
  toKey,
} from "./utils";
const libsodium = require("libsodium-wrappers-sumo");
const fetch = require("node-fetch");
const _ = require("lodash");
const cbor = require("borc");
const nacl = require("tweetnacl");
const fs = require("fs");
const yaml = require("js-yaml");
const path = require("path");
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default class Client {

  public static fromConfig(configPath) {
    const privateKey = new Buffer(
      yaml.safeLoad(fs.readFileSync(configPath)).privateKey,
      "base64",
    );

    return new this({
      privateKey,
    });
  }
  public privateKey: Buffer;

  constructor({ privateKey }) {
    this.privateKey = privateKey;
  }

  public edgeServer() {
    // Once we go live we'll ask the seed servers for their peers
    // and call a list of edge nodes round-robin.
    // For now just send transactions directly to the seed nodes

    return _.sample(ELIPITCOIN_SEED_EDGE_SERVERS);
  }

  public async sign(message) {
    await libsodium.ready;
    return libsodium.crypto_sign_detached(message, this.privateKey);
  }

  public async publicKey() {
    await libsodium.ready;
    return new Buffer(libsodium.crypto_sign_ed25519_sk_to_pk(this.privateKey));
  }

  public async deploy(contractName, contractCode, constructorParams) {
    return this.post({
      contract_address: Buffer.concat([new Buffer(32), new Buffer("System")]),
      function: "create_contract",
      arguments: [contractName, contractCode, constructorParams],
    });
  }

  public async post(transaction) {
    const body = {
      sender: await this.publicKey(),
      gas_limit: 100000000,
      nonce: await randomUnit32(),
      ...transaction,
    };
    const signedBody = await cbor.encode({
      ...body,
      signature: new Buffer(await this.sign(await cbor.encode(body))),
    });

    const response = await fetch(this.edgeServer() + "/transactions", {
      method: "POST",
      // mode: "cors",
      body: signedBody,
      headers: {
        "Content-Type": "application/cbor",
      },
    });

    if (response.status != 201) {
      throw await response.text();
    } else {
      return body;
    }
  }

  public async waitForTransactionToBeMined(transaction, tries = 600) {
    const transactionHash = objectHash(transaction);
    try {
      return await this.getTransaction(transactionHash);
    } catch (err) {
      if (tries == 1) { throw new Error("Transaction too too long to be mined"); }
      await sleep(500);
      return await this.waitForTransactionToBeMined(transaction, tries - 1);
    }
  }

  public async getTransaction(transactionHash) {
    return fetch(
      this.edgeServer() + "/transactions/" + base64url(transactionHash),
    ).then(async response => {
      if (response.status == 404) {
        throw new Error("Transaction not found");
      } else {
        const arrayBuffer = await response.arrayBuffer();
        return cbor.decode(Buffer.from(arrayBuffer));
      }
    });
  }

  public async getMemory(contractAddress, contractName, key) {
    const fullKey = toKey(contractAddress, contractName, key);
    const response = await fetch(this.edgeServer() + "/memory/" + base64url(fullKey));
    return cbor.decode(Buffer.from(await response.arrayBuffer()));
  }
}
