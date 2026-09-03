import { IsEnum, IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserIdentityProvider } from '../entities/user-identity.entity';

export class SocialLoginDto {
  @ApiProperty({ enum: UserIdentityProvider })
  @IsEnum(UserIdentityProvider)
  provider: UserIdentityProvider;

  @ApiProperty({ example: 'provider-user-id-123' })
  @IsString()
  providerUserId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nom?: string;
}