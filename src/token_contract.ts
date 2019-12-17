import Contract from "./contract";
import { bytesToNumber } from "./utils";
const BALANCE_KEY = new Buffer([0]);

export default class TokenContract extends Contract {
  public approve(recipientAddress, amount) {
    const transaction = this.createTransaction(
      "approve",
      recipientAddress,
      amount,
    );

    if (this.client) {
      return this.client.post(transaction);
    }
  }

  public transfer(recipientAddress, amount) {
    const transaction = this.createTransaction(
      "transfer",
      recipientAddress,
      amount,
    );

    if (this.client) {
      return this.client.post(transaction);
    }
  }

  public async balanceOf(address) {
    const balanceBytes = await this.getMemory(
      Buffer.concat([BALANCE_KEY, address]),
    );

    if (balanceBytes) {
      return bytesToNumber(balanceBytes);
    } else {
      return 0;
    }
  }
}
