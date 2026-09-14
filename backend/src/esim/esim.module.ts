import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EsimController } from './esim.controller';
import { EsimService } from './esim.service';
import { EsimOrder } from './entities/esim-order.entity';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [TypeOrmModule.forFeature([EsimOrder]), PaymentModule],
  controllers: [EsimController],
  providers: [EsimService],
})
export class EsimModule {}
