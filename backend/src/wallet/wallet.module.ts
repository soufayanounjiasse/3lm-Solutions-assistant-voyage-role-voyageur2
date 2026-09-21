import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Voyage } from '../trip/entities/voyage.entity';
import { Reservation } from '../trip/entities/reservation.entity';
import { Document } from '../trip/entities/document.entity';
import { EsimOrder } from '../esim/entities/esim-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Voyage, Reservation, Document, EsimOrder])],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
