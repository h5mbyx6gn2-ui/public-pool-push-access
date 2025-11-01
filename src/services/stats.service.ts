import { Injectable } from '@nestjs/common';

@Injectable()
export class StatsService {
  getStats() {
    return {
      connectedMiners: 1, // Replace with real miner count
      hashrate: 123456789, // Replace with real hashrate
      lastBlockHeight: 812345 // Replace with real block height
    };
  }
}
