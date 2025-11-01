import { Controller, Get } from '@nestjs/common';
import { StatsService } from '../services/stats.service';

@Controller('api')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('pool-stats')
  getStats() {
    return this.statsService.getStats();
  }
}
