import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { Voyage } from './entities/voyage.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Voyage)
    private readonly voyageRepository: Repository<Voyage>,
  ) {}

  async create(voyageId: string, dto: CreateDocumentDto): Promise<Document> {
    const voyage = await this.voyageRepository.findOne({ where: { id: voyageId } });
    if (!voyage) {
      throw new NotFoundException(`Voyage avec l'id ${voyageId} introuvable`);
    }
    const document = new Document();
    document.voyageId = voyageId;
    document.type = dto.type;
    document.nomFichier = dto.nomFichier;
    document.urlS3 = dto.urlS3;
    return this.documentRepository.save(document);
  }

  async findAllByVoyage(voyageId: string): Promise<Document[]> {
    return this.documentRepository.find({
      where: { voyageId },
      order: { dateAjout: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document avec l'id ${id} introuvable`);
    }
    return document;
  }

  async update(id: string, dto: UpdateDocumentDto): Promise<Document> {
    const document = await this.findOne(id);
    Object.assign(document, dto);
    return this.documentRepository.save(document);
  }

  async remove(id: string): Promise<void> {
    const document = await this.findOne(id);
    await this.documentRepository.remove(document);
  }
}