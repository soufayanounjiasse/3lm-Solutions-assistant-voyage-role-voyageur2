import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import QRCode from 'qrcode';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { CreateEsimOrderDto } from './dto/create-esim-order.dto';
import { UpdateEsimUsageDto } from './dto/update-esim-usage.dto';
import { EsimOrder, EsimOrderStatus } from './entities/esim-order.entity';

export type EsimPlan = {
  id: string;
  country: string;
  countryCode: string;
  provider: string;
  dataMb: number;
  durationDays: number;
  price: number;
  currency: string;
};

const PLANS: EsimPlan[] = [
  { id: 'fr-5gb-15d', country: 'France', countryCode: 'FR', provider: 'Voya eSIM', dataMb: 5120, durationDays: 15, price: 8.99, currency: 'EUR' },
  { id: 'fr-10gb-30d', country: 'France', countryCode: 'FR', provider: 'Voya eSIM', dataMb: 10240, durationDays: 30, price: 14.99, currency: 'EUR' },
  { id: 'fr-20gb-30d', country: 'France', countryCode: 'FR', provider: 'Voya eSIM', dataMb: 20480, durationDays: 30, price: 22.99, currency: 'EUR' },
  { id: 'es-10gb-30d', country: 'Espagne', countryCode: 'ES', provider: 'Voya eSIM', dataMb: 10240, durationDays: 30, price: 14.99, currency: 'EUR' },
  { id: 'it-10gb-30d', country: 'Italie', countryCode: 'IT', provider: 'Voya eSIM', dataMb: 10240, durationDays: 30, price: 14.99, currency: 'EUR' },
];

@Injectable()
export class EsimService {
  constructor(
    @InjectRepository(EsimOrder)
    private readonly orderRepository: Repository<EsimOrder>,
  ) {}

  listPlans(country?: string): EsimPlan[] {
    if (!country) return PLANS;
    const normalized = country.trim().toLowerCase();
    return PLANS.filter(
      (plan) => plan.country.toLowerCase().includes(normalized) || plan.countryCode.toLowerCase() === normalized,
    );
  }

  async createOrder(dto: CreateEsimOrderDto): Promise<EsimOrder> {
    const plan = PLANS.find((candidate) => candidate.id === dto.planId);
    if (!plan) throw new NotFoundException('Forfait eSIM introuvable.');

    const activationCode = `LPA:1$sm-voya.example$${randomBytes(12).toString('hex')}`;
    const order = this.orderRepository.create({
      userId: dto.userId,
      planId: plan.id,
      country: plan.country,
      provider: plan.provider,
      dataMb: plan.dataMb,
      durationDays: plan.durationDays,
      price: plan.price,
      currency: plan.currency,
      status: EsimOrderStatus.CONFIRMED,
      activationCode,
      qrCodeDataUrl: await QRCode.toDataURL(activationCode),
      dataUsedMb: 0,
      usageUpdatedAt: new Date(),
    });
    return this.orderRepository.save(order);
  }

  listOrders(userId: string): Promise<EsimOrder[]> {
    return this.orderRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async getOrder(id: string): Promise<EsimOrder> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Commande eSIM introuvable.');
    return order;
  }

  async activate(id: string): Promise<EsimOrder> {
    const order = await this.getOrder(id);
    order.status = EsimOrderStatus.ACTIVATED;
    order.activatedAt = order.activatedAt ?? new Date();
    return this.orderRepository.save(order);
  }

  async updateUsage(id: string, dto: UpdateEsimUsageDto): Promise<EsimOrder> {
    const order = await this.getOrder(id);
    order.dataUsedMb = Math.min(dto.dataUsedMb, order.dataMb);
    order.usageUpdatedAt = new Date();
    return this.orderRepository.save(order);
  }
}
