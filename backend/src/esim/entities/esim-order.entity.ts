import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentMethod } from '../../payment/entities/payment-transaction.entity';

export enum EsimOrderStatus {
  CONFIRMED = 'CONFIRMED',
  ACTIVATED = 'ACTIVATED',
}

@Entity('esim_order')
export class EsimOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'plan_id' })
  planId: string;

  @Column()
  country: string;

  @Column({ name: 'provider' })
  provider: string;

  @Column({ name: 'data_mb', type: 'integer' })
  dataMb: number;

  @Column({ name: 'duration_days', type: 'integer' })
  durationDays: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ length: 3, default: 'EUR' })
  currency: string;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ type: 'enum', enum: EsimOrderStatus, default: EsimOrderStatus.CONFIRMED })
  status: EsimOrderStatus;

  @Column({ name: 'activation_code' })
  activationCode: string;

  @Column({ name: 'qr_code_data_url', type: 'text' })
  qrCodeDataUrl: string;

  @Column({ name: 'data_used_mb', type: 'integer', default: 0 })
  dataUsedMb: number;

  @Column({ name: 'usage_updated_at', type: 'timestamp' })
  usageUpdatedAt: Date;

  @Column({ name: 'activated_at', type: 'timestamp', nullable: true })
  activatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
