export class PayoutInformation {
  address: string;
  scriptPubKey: Buffer;

  constructor(address: string, scriptPubKey: Buffer) {
    this.address = address;
    this.scriptPubKey = scriptPubKey;
  }
}
