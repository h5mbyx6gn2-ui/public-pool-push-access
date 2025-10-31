import { ConfigService } from '@nestjs/config';
import { networks, address } from 'bitcoinjs-lib';
import { MiningJob } from './MiningJob';
import { JobTemplate } from './JobTemplate';
import { PayoutInformation } from './PayoutInformation';

describe('MiningJob', () => {
  let configService: ConfigService;
  let network: any;
  let jobTemplate: JobTemplate;
  let payoutInformation: PayoutInformation;

  beforeEach(() => {
    configService = {} as ConfigService;
    network = networks.bitcoin;

    jobTemplate = new JobTemplate(configService, network);
    jobTemplate.id = 'template-1';
    jobTemplate.block = {
      version: 1,
      previousBlockHash: '0000000000000000000',
      merkleRoot: 'abc123',
      witnessCommit: 'deadbeef',
      bits: '1d00ffff',
      curtime: 1234567890,
      height: [0x01, 0x02, 0x03],
    };
    jobTemplate.merkleBranch = ['branch1', 'branch2'];

    const payoutAddress = 'bc1qaeg3dcdc9srakpshrw345pg4ecj7h5ckcqah4q';
    payoutInformation = new PayoutInformation(
      payoutAddress,
      address.toOutputScript(payoutAddress, network)
    );
  });

  it('should construct a MiningJob correctly', () => {
    const job = new MiningJob(
      configService,
      network,
      'job-1',
      payoutInformation,
      jobTemplate
    );

    expect(job.jobId).toBe('job-1');
    expect(job.jobTemplateId).toBe('template-1');
    expect(job.coinbaseTransaction).toBeDefined();
    expect(job.payoutInformation.address).toBe('bc1qaeg3dcdc9srakpshrw345pg4ecj7h5ckcqah4q');
  });

  it('should generate a valid response', () => {
    const job = new MiningJob(
      configService,
      network,
      'job-2',
      payoutInformation,
      jobTemplate
    );

    const response = JSON.parse(job.response(jobTemplate));
    expect(response.job_id).toBe('job-2');
    expect(response.coinbase).toMatch(/^[0-9a-f]+$/);
    expect(response.merkle_branch).toEqual(['branch1', 'branch2']);
    expect(response.version).toBe(1);
    expect(response.prevhash).toBe('0000000000000000000');
    expect(response.bits).toBe('1d00ffff');
    expect(response.time).toBe(1234567890);
    expect(response.height).toEqual([0x01, 0x02, 0x03]);
    expect(response.clean_jobs).toBe(true);
  });

  it('should copy and update block correctly', () => {
    const job = new MiningJob(
      configService,
      network,
      'job-3',
      payoutInformation,
      jobTemplate
    );

    const newBlock = {
      version: 2,
      previousBlockHash: '1111111111111111111',
      merkleRoot: 'def456',
      witnessCommit: 'feedface',
      bits: '1d00aaaa',
      curtime: 987654321,
      height: [0x04, 0x05, 0x06],
    };

    const updatedJob = job.copyAndUpdateBlock(newBlock);
    expect(updatedJob.jobId).toBe('job-3');
    expect(updatedJob.jobTemplateId).toBe('template-1');
    expect(updatedJob.coinbaseTransaction).toBeDefined();
    expect(updatedJob.payoutInformation.address).toBe('bc1qaeg3dcdc9srakpshrw345pg4ecj7h5ckcqah4q');
  });
});
