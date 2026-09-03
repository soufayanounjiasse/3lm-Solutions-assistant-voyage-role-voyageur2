import { IsOptional, IsNumber, IsArray, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum TypeVoyage {
  AFFAIRES = 'AFFAIRES',
  TOURISME = 'TOURISME',
  FAMILLE = 'FAMILLE',
  ETUDIANT = 'ETUDIANT',
}

export class UpdatePreferenceDto {
  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  budgetMin?: number;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsNumber()
  budgetMax?: number;

  @ApiPropertyOptional({ example: ['plage', 'culture'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  centresInteret?: string[];

  @ApiPropertyOptional({ enum: TypeVoyage })
  @IsOptional()
  @IsEnum(TypeVoyage)
  typeVoyage?: TypeVoyage;
}