import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voyage, VoyageStatut } from './entities/voyage.entity';
import { CreateVoyageDto } from './dto/create-voyage.dto';
import { UpdateVoyageDto } from './dto/update-voyage.dto';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Voyage)
    private readonly voyageRepository: Repository<Voyage>,
  ) {}

  async create(createVoyageDto: CreateVoyageDto): Promise<Voyage> {
    const voyage = new Voyage();
    voyage.userId = createVoyageDto.userId;
    voyage.destination = createVoyageDto.destination;
    voyage.dateDebut = new Date(createVoyageDto.dateDebut);
    voyage.dateFin = new Date(createVoyageDto.dateFin);
    voyage.statut = VoyageStatut.A_VENIR;
    return this.voyageRepository.save(voyage);
  }

  async findAll(userId?: string): Promise<Voyage[]> {
    if (userId) {
      return this.voyageRepository.find({
        where: { userId },
        relations: { reservations: true, documents: true },
        order: { dateDebut: 'ASC' },
      });
    }
    return this.voyageRepository.find({
      relations: { reservations: true, documents: true },
      order: { dateDebut: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Voyage> {
    const voyage = await this.voyageRepository.findOne({
      where: { id },
      relations: { reservations: true, documents: true },
    });
    if (!voyage) {
      throw new NotFoundException(`Voyage avec l'id ${id} introuvable`);
    }
    return voyage;
  }

  async update(id: string, updateVoyageDto: UpdateVoyageDto): Promise<Voyage> {
    const voyage = await this.findOne(id);
    if (updateVoyageDto.destination !== undefined) {
      voyage.destination = updateVoyageDto.destination;
    }
    if (updateVoyageDto.dateDebut !== undefined) {
      voyage.dateDebut = new Date(updateVoyageDto.dateDebut);
    }
    if (updateVoyageDto.dateFin !== undefined) {
      voyage.dateFin = new Date(updateVoyageDto.dateFin);
    }
    if (updateVoyageDto.userId !== undefined) {
      voyage.userId = updateVoyageDto.userId;
    }
    return this.voyageRepository.save(voyage);
  }

  /**
   * Annule un voyage : change le statut, archive l'enregistrement,
   * et notifie l'utilisateur (stub en attendant l'intégration
   * du système de notifications - Firebase Cloud Messaging prévu au CDC).
   */
  async cancel(id: string): Promise<Voyage> {
    const voyage = await this.findOne(id);
    voyage.statut = VoyageStatut.ANNULE;
    voyage.archivedAt = new Date();
    const saved = await this.voyageRepository.save(voyage);
    this.notifyUserOfCancellation(saved);
    return saved;
  }

  private notifyUserOfCancellation(voyage: Voyage): void {
    // TODO: brancher sur le vrai système de notifications (FCM / email)
    // une fois le Module 1 (Compte utilisateur) et les notifications en place.
    console.log(
      `[NOTIFICATION] Voyage ${voyage.id} annulé pour l'utilisateur ${voyage.userId}.`,
    );
  }
}