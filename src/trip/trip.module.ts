import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { Voyage } from './entities/voyage.entity';
import { Reservation } from './entities/reservation.entity';
import { Document } from './entities/document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Voyage, Reservation, Document])],
  controllers: [TripController, ReservationController],
  providers: [TripService, ReservationService],
  exports: [TypeOrmModule],
})
export class TripModule {}