import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PaymentMethod } from './payment-transaction.entity';

@Entity('travel_wallet')
export class TravelWallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ length: 3, default: 'EUR' })
  currency: string;

  @Column({ name: 'preferred_method', type: 'enum', enum: PaymentMethod, default: PaymentMethod.CARD })
  preferredMethod: PaymentMethod;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}