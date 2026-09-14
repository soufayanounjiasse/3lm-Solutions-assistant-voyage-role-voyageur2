import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { PaymentMethod } from '../../payment/entities/payment-transaction.entity';

export { PaymentMethod as EsimPaymentMethod } from '../../payment/entities/payment-transaction.entity';

export class CreateEsimOrderDto {
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  planId: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
