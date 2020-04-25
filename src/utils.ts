const _ = require("lodash");
const cbor = require("borc");
const crypto = require("crypto");
const Long = require("long");
const BigNumber = require("bignumber.js");
import TokenContract from "./token_contract";
const { WORDS_FILE_PATH } = require("./constants");
const fs = require("fs");
const promisify = require("util").promisify;
const randomBytes = promisify(crypto.randomBytes);
const Buffer = require("buffer/").Buffer;
const ADDRESS_REGEXP = /\w+\w+-\d+/;

export function bytesToNumber(bytes) {
  return Long.fromBytesLE(Buffer.from(bytes)).toNumber();
}

export async function randomUnit32() {
  let bytes = await crypto.randomBytes(4)
  return bytes.readUInt32BE(0, true);
}


export function toBytesInt32(num) {
  const arr = new ArrayBuffer(4);
  const view = new DataView(arr);
  view.setUint32(0, num, true);
  return new Uint8Array(arr);
}

export function fromBytesInt32(buffer) {
  const arr = new ArrayBuffer(4);
  const view = new DataView(arr);
  buffer.forEach((value, index) => view.setUint8(index, value));
  return view.getUint32(0, true);
}

export function transactionHash(transaction) {
  return objectHash(
    _.omit(transaction, ["return_code", "return_value", "block_hash"]),
  );
}

export function objectHash(object) {
  return sha256(cbor.encode(object));
}

function sha256(message) {
  return crypto
    .createHash("sha256")
    .update(message, "utf8")
    .digest();
}

export function formatBalance(balance) {
  return new BigNumber(balance).div(10000).toFixed(4);
}
export function humanReadableAddressToU32Bytes(address) {
  const identifiers = address.split("-").reverse();
  const words = readWords();
  const int32Address =
    (parseInt(identifiers[0]) << 22) |
    (words.indexOf(identifiers[1]) << 11) |
    words.indexOf(identifiers[2]);

  return new Buffer(toBytesInt32(int32Address));
}

export async function coerceArgs(client, args) {
  return Promise.all(
    args.map(async arg => {
      if (arg.match(ADDRESS_REGEXP)) {
        return await client.resolveAddress(arg);
      } else if (arg.startsWith("base64:")) {
        return new Buffer(arg.slice(7), "base64");
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

export function balanceKey(address) {
  const key = new Uint8Array(address.length + 1);
  key.set(new Buffer([0]), 0);
  key.set(address, 1);
  return key;
}

export function toKey(address, contractName, key) {
  return Buffer.concat([
    Buffer.from(address),
    Buffer.from(padRight(stringToBytes(contractName))),
    Buffer.from(key),
  ]);
}

export function toAddress(address, contractName) {
  return Buffer.concat([address, stringToBytes(contractName)]);
}

function stringToBytes(s) {
  return new Buffer(s, "utf8");
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

export function tokenContractFromString(tokenString) {
  const tokens = {
    EC: new TokenContract(new Buffer(32), "Ellipticoin"),
  };
  if (tokens[tokenString]) {
    return tokens[tokenString];
  } else {
    const [address, contractName] = tokenString.split(":");
    return new TokenContract(new Buffer(address, "base64"), contractName);
  }
}
