import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Voyage } from './voyage.entity';

export enum DocumentType {
  PASSEPORT = 'PASSEPORT',
  VISA = 'VISA',
  BILLET = 'BILLET',
  VOUCHER = 'VOUCHER',
  AUTRE = 'AUTRE',
}

@Entity('document')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'voyage_id', type: 'uuid' })
  voyageId: string;

  @ManyToOne(() => Voyage, (voyage) => voyage.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voyage_id' })
  voyage: Voyage;

  @Column({ type: 'enum', enum: DocumentType })
  type: DocumentType;

  @Column({ name: 'nom_fichier' })
  nomFichier: string;

  @Column({ name: 'url_s3' })
  urlS3: string;

  @CreateDateColumn({ name: 'date_ajout' })
  dateAjout: Date;
}