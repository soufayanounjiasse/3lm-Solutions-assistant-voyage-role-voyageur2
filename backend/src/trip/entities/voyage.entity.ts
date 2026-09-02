import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  OneToMany, ManyToOne, JoinColumn,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { Document } from './document.entity';
import { User } from '../../user/entities/user.entity';

export enum VoyageStatut {
  A_VENIR = 'A_VENIR',
  EN_COURS = 'EN_COURS',
  PASSE = 'PASSE',
  ANNULE = 'ANNULE',
}

@Entity('voyage')
export class Voyage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.voyages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  destination: string;

  @Column({ name: 'date_debut', type: 'date' })
  dateDebut: Date;

  @Column({ name: 'date_fin', type: 'date' })
  dateFin: Date;

  @Column({ type: 'enum', enum: VoyageStatut, default: VoyageStatut.A_VENIR })
  statut: VoyageStatut;

  @Column({ name: 'archived_at', type: 'timestamp', nullable: true })
  archivedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Reservation, (reservation) => reservation.voyage, { cascade: true })
  reservations: Reservation[];

  @OneToMany(() => Document, (document) => document.voyage, { cascade: true })
  documents: Document[];
}