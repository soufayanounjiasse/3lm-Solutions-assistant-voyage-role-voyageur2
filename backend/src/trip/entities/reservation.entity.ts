import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { Voyage } from './voyage.entity';

export enum ReservationType {
  VOL = 'VOL',
  HOTEL = 'HOTEL',
  AUTRE = 'AUTRE',
}

export enum ReservationStatut {
  CONFIRMEE = 'CONFIRMEE',
  EN_ATTENTE = 'EN_ATTENTE',
  ANNULEE = 'ANNULEE',
}

@Entity('reservation')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'voyage_id', type: 'uuid' })
  voyageId: string;

  @ManyToOne(() => Voyage, (voyage) => voyage.reservations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voyage_id' })
  voyage: Voyage;

  @Column({ type: 'enum', enum: ReservationType })
  type: ReservationType;

  @Column()
  fournisseur: string;

  @Column()
  reference: string;

  @Column({ type: 'enum', enum: ReservationStatut, default: ReservationStatut.EN_ATTENTE })
  statut: ReservationStatut;

  @Column({ name: 'date_debut', type: 'timestamp' })
  dateDebut: Date;

  @Column({ name: 'date_fin', type: 'timestamp', nullable: true })
  dateFin: Date;
}