import {
  BadRequestException,
  Injectable,
  NotImplementedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentPreferenceDto } from './dto/update-payment-preference.dto';
import {
  PaymentMethod,
  PaymentStatus,
  PaymentTransaction,
} from './entities/payment-transaction.entity';
import { TravelWallet } from './entities/travel-wallet.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentTransaction)
    private readonly paymentRepository: Repository<PaymentTransaction>,
    @InjectRepository(TravelWallet)
    private readonly walletRepository: Repository<TravelWallet>,
  ) {}

  async charge(dto: CreatePaymentDto): Promise<PaymentTransaction> {
    const provider = this.getProvider(dto.method);

    if (
      dto.method !== PaymentMethod.WALLET &&
      !this.hasProviderKey(dto.method)
    ) {
      throw new ServiceUnavailableException(
        `API de paiement indisponible : clé absente pour ${provider}. Configurez ${this.getProviderKeyName(dto.method)} avant de réessayer.`,
      );
    }

    if (dto.method !== PaymentMethod.WALLET) {
      throw new NotImplementedException(
        `Le connecteur ${provider} est en attente d'intégration.`,
      );
    }

    if (dto.method === PaymentMethod.WALLET) {
      const paymentWallet = await this.walletRepository.findOne({
        where: { userId: dto.userId },
      });
      if (!paymentWallet || Number(paymentWallet.balance) < dto.amount) {
        throw new BadRequestException('Solde Travel Wallet insuffisant.');
      }
      paymentWallet.balance = Number(paymentWallet.balance) - dto.amount;
      await this.walletRepository.save(paymentWallet);
    }

    const wallet = await this.getWallet(dto.userId);
    wallet.preferredMethod = dto.method;
    await this.walletRepository.save(wallet);
    const transaction = this.paymentRepository.create({
      userId: dto.userId,
      serviceType: dto.serviceType,
      serviceId: dto.serviceId,
      amount: dto.amount,
      currency: dto.currency,
      method: dto.method,
      status: PaymentStatus.PAID,
      provider,
      providerPaymentId: `${provider}_${randomBytes(12).toString('hex')}`,
      receiptNumber: `VOYA-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`,
    });
    return this.paymentRepository.save(transaction);
  }

  private getProvider(method: PaymentMethod): string {
    if (method === PaymentMethod.CARD) return 'stripe';
    if (method === PaymentMethod.MOBILE)
      return process.env.MOBILE_PAYMENT_PROVIDER ?? 'mobile-gateway';
    return 'travel-wallet';
  }

  private getProviderKeyName(method: PaymentMethod): string {
    return method === PaymentMethod.CARD
      ? 'STRIPE_SECRET_KEY'
      : 'MOBILE_PAYMENT_API_KEY';
  }

  private hasProviderKey(method: PaymentMethod): boolean {
    const keyName = this.getProviderKeyName(method);
    return Boolean(process.env[keyName]?.trim());
  }

  listReceipts(userId: string): Promise<PaymentTransaction[]> {
    return this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getWallet(userId: string): Promise<TravelWallet> {
    const existing = await this.walletRepository.findOne({ where: { userId } });
    if (existing) return existing;
    return this.walletRepository.save(
      this.walletRepository.create({
        userId,
        balance: 0,
        currency: 'EUR',
        preferredMethod: PaymentMethod.CARD,
      }),
    );
  }

  async updatePreference(
    dto: UpdatePaymentPreferenceDto,
  ): Promise<TravelWallet> {
    const wallet = await this.getWallet(dto.userId);
    wallet.preferredMethod = dto.method;
    return this.walletRepository.save(wallet);
  }
}
