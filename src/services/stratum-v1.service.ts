import { Injectable } from '@nestjs/common';
import { StratumV1Client } from '../models/StratumV1Client';
import { NotificationService } from './notification.service';

@Injectable()
export class StratumV1Service {
  private clients: StratumV1Client[] = [];

  constructor(
    private readonly notificationService: NotificationService
  ) {}

  registerClient(client: StratumV1Client) {
    // Stub missing properties for compatibility
    (client as any).extraNonceAndSessionId = 'stub-session-id';
    (client as any).destroy = async () => {
      console.log(`Destroying client ${(client as any).extraNonceAndSessionId}`);
    };

    this.clients.push(client);
  }

  async disconnectClient(client: StratumV1Client, hadError: boolean) {
    if ((client as any).extraNonceAndSessionId != null) {
      await (client as any).destroy();
      console.log(`Client ${(client as any).extraNonceAndSessionId} disconnected, hadError?:${hadError}`);
    }
  }
}
