import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransportBookingDto } from './dto/create-transport-booking.dto';
import { UpdateTransportBookingDto } from './dto/update-transport-booking.dto';
import { Driver } from './entities/driver.entity';
import { TransportBooking, TransportBookingStatus } from './entities/transport-booking.entity';

@Injectable()
export class TransportService {
  constructor(
    @InjectRepository(Driver) private readonly driverRepository: Repository<Driver>,
    @InjectRepository(TransportBooking) private readonly bookingRepository: Repository<TransportBooking>,
  ) {}

  listDrivers(availableOnly = true): Promise<Driver[]> {
    return this.driverRepository.find({
      where: availableOnly ? { isAvailable: true } : {},
      order: { rating: 'DESC', pricePerKm: 'ASC' },
    });
  }

  async createBooking(dto: CreateTransportBookingDto): Promise<TransportBooking> {
    const driver = await this.driverRepository.findOne({ where: { id: dto.driverId, isAvailable: true } });
    if (!driver) throw new NotFoundException('Chauffeur indisponible.');
    const booking = this.bookingRepository.create({
      ...dto,
      scheduledAt: new Date(dto.scheduledAt),
      price: Number(driver.pricePerKm) * 10,
      status: TransportBookingStatus.CONFIRMED,
    });
    return this.bookingRepository.save(booking);
  }

  listBookings(userId: string): Promise<TransportBooking[]> {
    return this.bookingRepository.find({ where: { userId }, relations: { driver: true }, order: { createdAt: 'DESC' } });
  }

  async updateBooking(id: string, dto: UpdateTransportBookingDto): Promise<TransportBooking> {
    const booking = await this.bookingRepository.findOne({ where: { id }, relations: { driver: true } });
    if (!booking) throw new NotFoundException('Réservation de transport introuvable.');
    Object.assign(booking, dto);
    return this.bookingRepository.save(booking);
  }
}