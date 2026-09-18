import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEsimOrderDto } from './dto/create-esim-order.dto';
import { UpdateEsimUsageDto } from './dto/update-esim-usage.dto';
import { EsimOrder, EsimOrderStatus } from './entities/esim-order.entity';
import { PaymentService } from '../payment/payment.service';
import { ESIM_PROVIDER } from './providers/esim-provider.interface';
import type { EsimProvider } from './providers/esim-provider.interface';


@Injectable()
export class EsimService {
  constructor(
    @InjectRepository(EsimOrder)
    private readonly orderRepository: Repository<EsimOrder>,
    private readonly paymentService: PaymentService,
    @Inject(ESIM_PROVIDER)
    private readonly provider: EsimProvider,
  ) {}

  listPlans(country?: string) {
    return this.provider.listPlans(country);
  }

  async createOrder(dto: CreateEsimOrderDto): Promise<EsimOrder> {
    const plans = await this.provider.listPlans();
    const plan = plans.find((candidate) => candidate.id === dto.planId);
    if (!plan) throw new NotFoundException('Forfait eSIM introuvable.');

    const orderId = crypto.randomUUID();

    // Le paiement est vérifié AVANT toute commande réelle chez le provider :
    // paymentService.charge() lève une exception si le paiement échoue,
    // ce qui interrompt createOrder avant la ligne suivante.
    await this.paymentService.charge({
      userId: dto.userId,
      serviceType: 'ESIM',
      serviceId: orderId,
      amount: plan.price,
      currency: plan.currency,
      method: dto.paymentMethod,
    });

    const providerResult = await this.provider.submitOrder(plan);

    const order = this.orderRepository.create({
      id: orderId,
      userId: dto.userId,
      planId: plan.id,
      country: plan.country,
      provider: plan.provider,
      dataMb: plan.dataMb,
      durationDays: plan.durationDays,
      price: plan.price,
      currency: plan.currency,
      paymentMethod: dto.paymentMethod,
      status: EsimOrderStatus.CONFIRMED,
      externalOrderId: providerResult.externalOrderId,
      activationCode: providerResult.activationCode,
      qrCodeDataUrl: providerResult.qrCodeDataUrl,
      dataUsedMb: 0,
      usageUpdatedAt: new Date(),
    });
    return this.orderRepository.save(order);
  }

  listOrders(userId: string): Promise<EsimOrder[]> {
    if (!isUuid(userId)) return Promise.resolve([]);
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

  /** Interroge le provider et persiste la consommation à jour d'une commande. */
  async refreshUsage(order: EsimOrder): Promise<EsimOrder> {
    if (!order.externalOrderId) return order;
    const usage = await this.provider.getUsage({
      externalOrderId: order.externalOrderId,
      dataMb: order.dataMb,
      activatedAt: order.activatedAt,
    });
    order.dataUsedMb = Math.min(usage.dataUsedMb, order.dataMb);
    order.usageUpdatedAt = new Date();
    return this.orderRepository.save(order);
  }

  /** Utilisé par la tâche planifiée : rafraîchit toutes les eSIM activées. */
  async refreshAllActivatedUsages(): Promise<void> {
    const activatedOrders = await this.orderRepository.find({
      where: { status: EsimOrderStatus.ACTIVATED },
    });
    for (const order of activatedOrders) {
      try {
        await this.refreshUsage(order);
      } catch {
        // On continue avec les autres commandes même si l'une échoue
        // (ex. provider temporairement indisponible).
      }
    }
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value ?? '');
}