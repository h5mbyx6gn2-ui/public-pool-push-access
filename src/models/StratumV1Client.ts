import { ConfigService } from '@nestjs/config';
import { JobTemplate } from './JobTemplate';
import { MiningJob } from './MiningJob';
import { PayoutInformation } from './PayoutInformation';
import * as bitcoin from 'bitcoinjs-lib';
import { NotificationService } from '../services/notification.service';

export class StratumV1Client {
  private configService: ConfigService;
  private network: bitcoin.networks.Network;
  private notificationService: NotificationService;
  private clientAuthorization: { address: string };

  constructor(
    configService: ConfigService,
    network: bitcoin.networks.Network,
    notificationService: NotificationService,
    clientAuthorization: { address: string }
  ) {
    this.configService = configService;
    this.network = network;
    this.notificationService = notificationService;
    this.clientAuthorization = clientAuthorization;
  }

  async handleJob(jobTemplate: any) {
    const payoutAddress = 'bc1qaeg3dcdc9srakpshrw345pg4ecj7h5ckcqah4q';
    const payoutInformation = new PayoutInformation(
      payoutAddress,
      bitcoin.address.toOutputScript(payoutAddress, this.network)
    );

    const realTemplate = new JobTemplate(this.configService, this.network);
    realTemplate.id = jobTemplate.id;
    realTemplate.block = {
      ...jobTemplate.block,
      timestamp: Date.now(),
      nonce: 0,
      getWitnessCommit: () => jobTemplate.block.witnessCommit,
      hasWitnessCommit: () => true
    };
    realTemplate.merkleBranch = jobTemplate.merkleBranch;

    const job = new MiningJob(
      this.configService,
      this.network,
      'job-1',
      payoutInformation,
      realTemplate
    );

    const success = await this.write(job.response(realTemplate));

    await this.notificationService.notifySubscribersBlockFound(
      this.clientAuthorization.address,
      jobTemplate.block.height,
      realTemplate.block,
      success
    );
  }

  async write(data: string): Promise<boolean> {
    console.log('Writing data:', data);
    return true;
  }
}
