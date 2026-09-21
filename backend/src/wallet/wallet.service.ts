import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voyage } from '../trip/entities/voyage.entity';
import { Reservation } from '../trip/entities/reservation.entity';
import { Document } from '../trip/entities/document.entity';
import { EsimOrder } from '../esim/entities/esim-order.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Voyage)
    private readonly voyageRepository: Repository<Voyage>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(EsimOrder)
    private readonly esimOrderRepository: Repository<EsimOrder>,
  ) {}

  async getByVoyage(voyageId: string) {
    const voyage = await this.voyageRepository.findOne({ where: { id: voyageId } });
    if (!voyage) {
      throw new NotFoundException(`Voyage avec l'id ${voyageId} introuvable`);
    }

    const [reservations, documents, esims] = await Promise.all([
      this.reservationRepository.find({ where: { voyageId }, order: { dateDebut: 'ASC' } }),
      this.documentRepository.find({ where: { voyageId }, order: { dateAjout: 'DESC' } }),
      this.esimOrderRepository.find({ where: { voyageId }, order: { createdAt: 'DESC' } }),
    ]);

    return { voyage, reservations, documents, esims };
  }
}
