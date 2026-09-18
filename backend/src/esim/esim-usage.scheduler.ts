import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EsimService } from './esim.service';

@Injectable()
export class EsimUsageScheduler {
  private readonly logger = new Logger(EsimUsageScheduler.name);

  constructor(private readonly esimService: EsimService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyUsageRefresh() {
    this.logger.log('Rafraîchissement horaire de la consommation eSIM...');
    await this.esimService.refreshAllActivatedUsages();
  }
}