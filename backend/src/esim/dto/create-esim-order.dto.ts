import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateEsimOrderDto {
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  planId: string;
}
