import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { TransportBookingStatus } from '../entities/transport-booking.entity';

export class UpdateTransportBookingDto {
  @IsEnum(TransportBookingStatus)
  @IsOptional()
  status?: TransportBookingStatus;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  ratingComment?: string;
}