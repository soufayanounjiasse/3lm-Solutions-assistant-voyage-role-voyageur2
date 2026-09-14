import { IsEnum, IsUUID } from 'class-validator';
import { PaymentMethod } from '../entities/payment-transaction.entity';

export class UpdatePaymentPreferenceDto {
  @IsUUID()
  userId: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}
