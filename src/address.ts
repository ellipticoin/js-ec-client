enum AddressType {
    PUBLIC_KEY,
    CONTRACT,
}

export default class Address {
  public static newPublicKey(address: Buffer) {
    return new this(
        AddressType.PUBLIC_KEY,
        address,
    );
  }

  public static newContract(address: Buffer, contractName: string) {
    return new this(
        AddressType.CONTRACT,
        address,
        contractName
    );
  }

  private constructor(
    private readonly addressType: AddressType,
    private readonly address: any,
    private readonly contractName?: string,
  ) {
  }

  public toBuffer() {
    if(this.addressType === AddressType.PUBLIC_KEY) {
        return this.address
    } else {
        return Buffer.concat([this.address, Buffer.from(this.contractName)])
    }
  }

  public toObject() {
    if(this.addressType === AddressType.PUBLIC_KEY) {
        return {
            PublicKey: Array.from(this.address)
        }
    } else {
        return {
            Contract: [Array.from(this.address), this.contractName]
        }
    }
  }
}
