import { ConfigService } from '@nestjs/config';
import { networks } from 'bitcoinjs-lib';

export class JobTemplate {
  id: string;
  block: {
    version: number;
    previousBlockHash: string;
    merkleRoot: string;
    witnessCommit: string;
    bits: string;
    curtime: number;
    height: number[];
  };
  merkleBranch: string[];

  constructor(
    private readonly configService: ConfigService,
    private readonly network: networks.Network
  ) {
    this.id = '';
    this.block = {
      version: 0,
      previousBlockHash: '',
      merkleRoot: '',
      witnessCommit: '',
      bits: '',
      curtime: 0,
      height: [],
    };
    this.merkleBranch = [];
  }
}
