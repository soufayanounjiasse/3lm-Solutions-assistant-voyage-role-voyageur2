import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Voyage } from '../../trip/entities/voyage.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import { UserIdentity } from './user-identity.entity';
import { UserPreference } from './user-preference.entity';

export enum UserStatut {
  ACTIF = 'ACTIF',
  SUSPENDU = 'SUSPENDU',
}

export enum UserLangue {
  FR = 'FR',
  EN = 'EN',
}

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'telephone', nullable: true })
  telephone: string;

  @Column({ name: 'password_hash', nullable: true, select: false })
  passwordHash: string;

  @Column()
  prenom: string;

  @Column()
  nom: string;

  @Column({ name: 'photo_url', nullable: true })
  photoUrl: string;

  @Column({ type: 'enum', enum: UserLangue, default: UserLangue.FR })
  langue: UserLangue;

  @Column({ type: 'enum', enum: UserStatut, default: UserStatut.ACTIF })
  statut: UserStatut;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => UserPreference, (preferences) => preferences.user, {
    cascade: true,
  })
  preferences: UserPreference;

  @OneToMany(() => UserIdentity, (identity) => identity.user, { cascade: true })
  identities: UserIdentity[];

  @OneToMany(() => PasswordResetToken, (token) => token.user, { cascade: true })
  passwordResetTokens: PasswordResetToken[];

  @OneToMany(() => Voyage, (voyage) => voyage.user)
  voyages: Voyage[];
}