import { IsEmail, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiPropertyOptional({ example: 'jean@exemple.com' })
  @ValidateIf((o) => !o.telephone)
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+237600000000' })
  @ValidateIf((o) => !o.email)
  @IsString()
  telephone?: string;

  @ApiProperty({ example: 'motdepasse123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  prenom: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  nom: string;
}