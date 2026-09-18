import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EsimController } from './esim.controller';
import { EsimService } from './esim.service';
import { EsimUsageScheduler } from './esim-usage.scheduler';
import { EsimOrder } from './entities/esim-order.entity';
import { PaymentModule } from '../payment/payment.module';
import { ESIM_PROVIDER } from './providers/esim-provider.interface';
import { MockEsimProvider } from './providers/mock-esim.provider';
import { AiraloEsimProvider } from './providers/airalo-esim.provider';

@Module({
  imports: [TypeOrmModule.forFeature([EsimOrder]), PaymentModule, ConfigModule],
  controllers: [EsimController],
  providers: [
    EsimService,
    EsimUsageScheduler,
    MockEsimProvider,
    AiraloEsimProvider,
    {
      provide: ESIM_PROVIDER,
      useFactory: (config: ConfigService, mock: MockEsimProvider, airalo: AiraloEsimProvider) => {
        const selected = config.get<string>('ESIM_PROVIDER', 'mock');
        return selected === 'airalo' ? airalo : mock;
      },
      inject: [ConfigService, MockEsimProvider, AiraloEsimProvider],
    },
  ],
})
export class EsimModule {}