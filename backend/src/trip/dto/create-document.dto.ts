import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '../entities/document.entity';

export class CreateDocumentDto {
  @ApiProperty({ enum: DocumentType, example: DocumentType.BILLET })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty({ example: 'billet-avion-AF1234.pdf' })
  @IsString()
  @IsNotEmpty()
  nomFichier: string;

  @ApiProperty({ example: 'https://voya-bucket.s3.amazonaws.com/documents/billet-avion-AF1234.pdf' })
  @IsString()
  @IsNotEmpty()
  urlS3: string;
}