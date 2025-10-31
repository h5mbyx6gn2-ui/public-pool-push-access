import { ConfigService } from '@nestjs/config';
import { networks, Transaction, script, opcodes } from 'bitcoinjs-lib';
import { JobTemplate } from './JobTemplate';
import { PayoutInformation } from './PayoutInformation';

export class MiningJob {
  jobId: string;
  creation: number;
  jobTemplateId: string;
  coinbaseTransaction: Transaction;
  payoutInformation: PayoutInformation;

  constructor(
    private readonly configService: ConfigService,
    private readonly network: networks.Network,
    jobId: string,
    payoutInformation: PayoutInformation,
    jobTemplate: JobTemplate
  ) {
    this.jobId = jobId;
    this.creation = Date.now();
    this.jobTemplateId = jobTemplate.id;
    this.payoutInformation = payoutInformation;

    this.coinbaseTransaction = new Transaction();

    const blockHeightLengthByte = Uint8Array.from(Buffer.from([jobTemplate.block.height.length]));
    const blockHeightEncoded = Uint8Array.from(Buffer.from(jobTemplate.block.height));
    const extra = Uint8Array.from(Buffer.from([0x00]));
    const padding = Uint8Array.from(Buffer.alloc(10, 0x00));

    const scriptSig = Uint8Array.from(Buffer.concat([
      Buffer.from(blockHeightLengthByte),
      Buffer.from(blockHeightEncoded),
      Buffer.from(extra),
      Buffer.from(padding)
    ]));

    this.coinbaseTransaction.addInput(Buffer.alloc(32), 0xffffffff);
    this.coinbaseTransaction.ins[0].script = scriptSig;

    const segwitMagicBits = Uint8Array.from(Buffer.from([0xaa, 0x21, 0xa9, 0xed]));
    const witnessCommit = Uint8Array.from(Buffer.from(jobTemplate.block.witnessCommit));

    this.coinbaseTransaction.addOutput(
      script.compile([
        opcodes.OP_RETURN,
        Uint8Array.from(Buffer.concat([
          Buffer.from(segwitMagicBits),
          Buffer.from(witnessCommit)
        ]))
      ]),
      0
    );
  }

  response(jobTemplate: JobTemplate): string {
    return JSON.stringify({
      job_id: this.jobId,
      coinbase: this.coinbaseTransaction.toHex(),
      merkle_branch: jobTemplate.merkleBranch,
      version: jobTemplate.block.version,
      prevhash: jobTemplate.block.previousBlockHash,
      bits: jobTemplate.block.bits,
      time: jobTemplate.block.curtime,
      height: jobTemplate.block.height,
      clean_jobs: true
    });
  }

  copyAndUpdateBlock(newBlock: JobTemplate['block']): MiningJob {
    const updatedTemplate = new JobTemplate(this.configService, this.network);
    updatedTemplate.id = this.jobTemplateId;
    updatedTemplate.block = newBlock;
    updatedTemplate.merkleBranch = [];

    return new MiningJob(
      this.configService,
      this.network,
      this.jobId,
      this.payoutInformation,
      updatedTemplate
    );
  }
}
