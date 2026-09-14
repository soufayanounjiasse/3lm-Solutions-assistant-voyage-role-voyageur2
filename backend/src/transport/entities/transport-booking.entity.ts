import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Driver } from './driver.entity';

export enum TransportBookingStatus {
  CONFIRMED = 'CONFIRMED',
  EN_ROUTE = 'EN_ROUTE',
  ARRIVED = 'ARRIVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('transport_booking')
export class TransportBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'driver_id', type: 'uuid' })
  driverId: string;

  @ManyToOne(() => Driver)
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @Column({ name: 'pickup_address' })
  pickupAddress: string;

  @Column({ name: 'dropoff_address' })
  dropoffAddress: string;

  @Column({ name: 'scheduled_at', type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: TransportBookingStatus, default: TransportBookingStatus.CONFIRMED })
  status: TransportBookingStatus;

  @Column({ type: 'integer', nullable: true })
  rating: number;

  @Column({ name: 'rating_comment', nullable: true })
  ratingComment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}