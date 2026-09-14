import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { TransportBooking } from './entities/transport-booking.entity';
import { TransportController } from './transport.controller';
import { TransportService } from './transport.service';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, TransportBooking])],
  controllers: [TransportController],
  providers: [TransportService],
})
export class TransportModule {}