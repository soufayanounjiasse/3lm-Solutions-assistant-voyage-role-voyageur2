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
    const voyage = this.voyageRepository.create({
      ...createVoyageDto,
      userId: createVoyageDto.userId,
      dateDebut: new Date(createVoyageDto.dateDebut),
      dateFin: new Date(createVoyageDto.dateFin),
      statut: VoyageStatut.A_VENIR,
    });
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
    Object.assign(voyage, {
      ...updateVoyageDto,
      dateDebut: updateVoyageDto.dateDebut ? new Date(updateVoyageDto.dateDebut) : voyage.dateDebut,
      dateFin: updateVoyageDto.dateFin ? new Date(updateVoyageDto.dateFin) : voyage.dateFin,
    });
    return this.voyageRepository.save(voyage);
  }

  async cancel(id: string): Promise<Voyage> {
    const voyage = await this.findOne(id);
    voyage.statut = VoyageStatut.ANNULE;
    return this.voyageRepository.save(voyage);
  }

  async remove(id: string): Promise<void> {
    const voyage = await this.findOne(id);
    await this.voyageRepository.remove(voyage);
  }
}