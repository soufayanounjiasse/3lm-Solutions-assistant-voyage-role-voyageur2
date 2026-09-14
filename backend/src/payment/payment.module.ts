import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { TravelWallet } from './entities/travel-wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentTransaction, TravelWallet])],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}