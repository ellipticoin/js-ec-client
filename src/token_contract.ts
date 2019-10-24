var Long = require("long");
import Contract from "./contract";
const BALANCE_KEY = new Buffer([0]);

function bytesToNumber(bytes) {
  return Long.fromBytesLE(Buffer.from(bytes)).toNumber()
}

export default class TokenContract extends Contract {
  async approve (recipientAddress, amount) {
    return this.post("approve", [recipientAddress, amount]);
  }

  async transfer (recipientAddress, amount) {
    return this.post("transfer", [recipientAddress, amount]);
  }

  async balanceOf (address) {
    let balanceBytes = await this.getMemory(Buffer.concat([BALANCE_KEY, address]));

    if (balanceBytes) {
      return bytesToNumber(balanceBytes);
    } else {
      return 0;
    }
  }
}
