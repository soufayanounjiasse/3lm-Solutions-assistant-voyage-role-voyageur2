import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'jean@exemple.com ou +237600000000' })
  @IsString()
  identifiant: string; // email ou téléphone

  @ApiProperty()
  @IsString()
  password: string;
}