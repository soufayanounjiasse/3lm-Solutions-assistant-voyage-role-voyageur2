import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTransportBookingDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  driverId: string;

  @IsNotEmpty()
  pickupAddress: string;

  @IsNotEmpty()
  dropoffAddress: string;

  @IsDateString()
  scheduledAt: string;
}