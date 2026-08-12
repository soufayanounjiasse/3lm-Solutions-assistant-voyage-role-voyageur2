import { IsEnum, IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationType, ReservationStatut } from '../entities/reservation.entity';

export class CreateReservationDto {
  @ApiProperty({ enum: ReservationType, example: ReservationType.VOL })
  @IsEnum(ReservationType)
  type: ReservationType;

  @ApiProperty({ example: 'Air France' })
  @IsString()
  @IsNotEmpty()
  fournisseur: string;

  @ApiProperty({ example: 'AF1234-XYZ' })
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiPropertyOptional({ enum: ReservationStatut, example: ReservationStatut.CONFIRMEE })
  @IsEnum(ReservationStatut)
  @IsOptional()
  statut?: ReservationStatut;

  @ApiProperty({ example: '2026-09-17T08:30:00Z' })
  @IsDateString()
  dateDebut: string;

  @ApiPropertyOptional({ example: '2026-09-17T11:00:00Z' })
  @IsDateString()
  @IsOptional()
  dateFin?: string;
}