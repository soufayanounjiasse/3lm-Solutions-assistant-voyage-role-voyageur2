import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum TypeVoyage {
  AFFAIRES = 'AFFAIRES',
  TOURISME = 'TOURISME',
  FAMILLE = 'FAMILLE',
  ETUDIANT = 'ETUDIANT',
}

@Entity('user_preference')
export class UserPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ name: 'budget_min', type: 'numeric', precision: 12, scale: 2, nullable: true })
  budgetMin: string;

  @Column({ name: 'budget_max', type: 'numeric', precision: 12, scale: 2, nullable: true })
  budgetMax: string;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  centresInteret: string[];

  @Column({ name: 'type_voyage', type: 'enum', enum: TypeVoyage, nullable: true })
  typeVoyage: TypeVoyage;

  @OneToOne(() => User, (user) => user.preferences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}