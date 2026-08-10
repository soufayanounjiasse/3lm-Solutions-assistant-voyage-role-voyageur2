import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatut } from './entities/reservation.entity';
import { Voyage } from './entities/voyage.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Voyage)
    private readonly voyageRepository: Repository<Voyage>,
  ) {}

 async create(voyageId: string, dto: CreateReservationDto): Promise<Reservation> {
  const voyage = await this.voyageRepository.findOne({ where: { id: voyageId } });
  if (!voyage) {
    throw new NotFoundException(`Voyage avec l'id ${voyageId} introuvable`);
  }
  const reservation = new Reservation();
  reservation.voyageId = voyageId;
  reservation.type = dto.type;
  reservation.fournisseur = dto.fournisseur;
  reservation.reference = dto.reference;
  reservation.statut = dto.statut ?? ReservationStatut.EN_ATTENTE;
  reservation.dateDebut = new Date(dto.dateDebut);
  if (dto.dateFin) {
    reservation.dateFin = new Date(dto.dateFin);
  }
  return this.reservationRepository.save(reservation);
}

  async findAllByVoyage(voyageId: string): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { voyageId },
      order: { dateDebut: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({ where: { id } });
    if (!reservation) {
      throw new NotFoundException(`Réservation avec l'id ${id} introuvable`);
    }
    return reservation;
  }

  async update(id: string, dto: UpdateReservationDto): Promise<Reservation> {
    const reservation = await this.findOne(id);
    Object.assign(reservation, {
      ...dto,
      dateDebut: dto.dateDebut ? new Date(dto.dateDebut) : reservation.dateDebut,
      dateFin: dto.dateFin ? new Date(dto.dateFin) : reservation.dateFin,
    });
    return this.reservationRepository.save(reservation);
  }

  async remove(id: string): Promise<void> {
    const reservation = await this.findOne(id);
    await this.reservationRepository.remove(reservation);
  }
}