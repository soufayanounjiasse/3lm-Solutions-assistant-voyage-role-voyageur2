import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentMethod {
  CARD = 'CARD',
  MOBILE = 'MOBILE',
  WALLET = 'WALLET',
}

export enum PaymentStatus {
  PAID = 'PAID',
  FAILED = 'FAILED',
}

@Entity('payment_transaction')
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'service_type' })
  serviceType: string;

  @Column({ name: 'service_id' })
  serviceId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'EUR' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PAID })
  status: PaymentStatus;

  @Column({ name: 'provider', nullable: true })
  provider: string;

  @Column({ name: 'provider_payment_id', nullable: true })
  providerPaymentId: string;

  @Column({ name: 'receipt_number', unique: true })
  receiptNumber: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}