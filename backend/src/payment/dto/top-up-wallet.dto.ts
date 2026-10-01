import { IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class TopUpWalletDto {
  @IsUUID()
  userId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  currency: string;
}
