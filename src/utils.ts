import * as cbor from "borc";
import * as crypto from "crypto";
import * as fs from "fs";
import * as _ from "lodash";

import BigNumber from "bignumber.js";
import Long from "long";
import { BASE_FACTOR, BLOCKS_PER_ERA, NUMBER_OF_ERAS, WORDS_FILE_PATH } from "./constants";

const ADDRESS_REGEXP = /\w+\w+-\d+/;

export function blockReward(blockNumber) {
    if (blockNumber > BLOCKS_PER_ERA * NUMBER_OF_ERAS) {
        return 0;
    }
    const era = Math.floor(blockNumber / BLOCKS_PER_ERA);
    return ((1.28*10**8)/2**era)/10**8
}

export function encodeAddress(address) {
  if (address.length === 2) {
    return {
      Contract: [Array.from(address[0]), address[1]],
    };
  } else {
    return {
      PublicKey: address,
    };
  }
}

export function addressToBuffer(address) {
  if (address.length === 2) {
    return Array.from(Buffer.concat([address[0], Buffer.from(address[1])]));
  } else {
    return address.toBuffer();
  }
}

export function transactionHash(transaction) {
  return objectHash(
    _.omit(transaction, ["return_code", "return_value", "block_hash"]),
  );
}

export function tokenId(ticker) {
  return Array.from(padBuffer(Buffer.from(ticker), 32));
}

export function padBuffer(buffer, len) {
  return Buffer.concat([
    buffer,
    Buffer.from(Array(len - buffer.length).fill(0)),
  ]);
}

export function objectHash(object) {
  return sha256(cbor.encode(object));
}

export function sha256(message) {
  return Array.from(crypto.createHash("sha256").update(message).digest());
}

export function formatBalance(balance) {
  return new BigNumber(balance).div(10000).toFixed(4);
}

export async function coerceArgs(client, args) {
  return Promise.all(
    args.map(async (arg) => {
      if (arg.match(ADDRESS_REGEXP)) {
        return await client.resolveAddress(arg);
      } else if (arg.startsWith("base64:")) {
        return Array.from(Buffer.from(arg.slice(7), "base64"));
      } else if (arg.startsWith("hex:")) {
        return Array.from(Buffer.from(arg.slice(4), "hex"));
      } else if (!isNaN(arg)) {
        return +arg;
      } else {
        return arg;
      }
    }),
  );
}

function readWords() {
  return fs.readFileSync(WORDS_FILE_PATH, "utf8").split("\n");
}

export function toKey(address, contractName, key) {
  return [base64url(address), contractName, base64url(Buffer.from(key))].join(
    "/",
  );
}

export function toAddress(address, contractName) {
  return Buffer.concat([address, stringToBytes(contractName)]);
}

function stringToBytes(s) {
  return Buffer.from(s, "utf8");
}
export async function randomUnit32() {
  const bytes = await crypto.randomBytes(4);
  return bytes.readUInt32BE(0);
}

function padRight(bytes) {
  const padded = new Uint8Array(255);
  padded.set(Uint8Array.from(bytes));
  return padded;
}

export function base64url(bytes) {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}
