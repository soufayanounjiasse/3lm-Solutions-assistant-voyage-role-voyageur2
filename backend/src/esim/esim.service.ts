import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import QRCode from 'qrcode';
import { randomBytes, randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CreateEsimOrderDto } from './dto/create-esim-order.dto';
import { UpdateEsimUsageDto } from './dto/update-esim-usage.dto';
import { EsimOrder, EsimOrderStatus } from './entities/esim-order.entity';
import { PaymentService } from '../payment/payment.service';

export type EsimPlan = {
  id: string;
  continent: string;
  country: string;
  countryCode: string;
  provider: string;
  dataMb: number;
  durationDays: number;
  price: number;
  currency: string;
};

type CountryDefinition = { continent: string; country: string; countryCode: string };

const COUNTRY_DEFINITIONS: CountryDefinition[] = [
  ...[
    ['Afrique', 'Afrique du Sud', 'ZA'], ['Afrique', 'Algérie', 'DZ'], ['Afrique', 'Angola', 'AO'],
    ['Afrique', 'Botswana', 'BW'], ['Afrique', 'Cameroun', 'CM'], ['Afrique', 'Côte d’Ivoire', 'CI'],
    ['Afrique', 'Égypte', 'EG'], ['Afrique', 'Éthiopie', 'ET'], ['Afrique', 'Ghana', 'GH'],
    ['Afrique', 'Kenya', 'KE'], ['Afrique', 'Madagascar', 'MG'], ['Afrique', 'Maroc', 'MA'],
    ['Afrique', 'Maurice', 'MU'], ['Afrique', 'Nigeria', 'NG'], ['Afrique', 'Sénégal', 'SN'],
  ],
  ...[
    ['Amérique', 'Argentine', 'AR'], ['Amérique', 'Brésil', 'BR'], ['Amérique', 'Canada', 'CA'],
    ['Amérique', 'Chili', 'CL'], ['Amérique', 'Colombie', 'CO'], ['Amérique', 'Costa Rica', 'CR'],
    ['Amérique', 'Cuba', 'CU'], ['Amérique', 'Équateur', 'EC'], ['Amérique', 'États-Unis', 'US'],
    ['Amérique', 'Guatemala', 'GT'], ['Amérique', 'Mexique', 'MX'], ['Amérique', 'Panama', 'PA'],
    ['Amérique', 'Pérou', 'PE'], ['Amérique', 'République dominicaine', 'DO'], ['Amérique', 'Uruguay', 'UY'],
  ],
  ...[
    ['Asie', 'Arabie saoudite', 'SA'], ['Asie', 'Chine', 'CN'], ['Asie', 'Corée du Sud', 'KR'],
    ['Asie', 'Émirats arabes unis', 'AE'], ['Asie', 'Hong Kong', 'HK'], ['Asie', 'Inde', 'IN'],
    ['Asie', 'Indonésie', 'ID'], ['Asie', 'Israël', 'IL'], ['Asie', 'Japon', 'JP'],
    ['Asie', 'Malaisie', 'MY'], ['Asie', 'Philippines', 'PH'], ['Asie', 'Singapour', 'SG'],
    ['Asie', 'Sri Lanka', 'LK'], ['Asie', 'Thaïlande', 'TH'], ['Asie', 'Vietnam', 'VN'],
  ],
  ...[
    ['Europe', 'Allemagne', 'DE'], ['Europe', 'Autriche', 'AT'], ['Europe', 'Belgique', 'BE'],
    ['Europe', 'Croatie', 'HR'], ['Europe', 'Danemark', 'DK'], ['Europe', 'Espagne', 'ES'],
    ['Europe', 'Finlande', 'FI'], ['Europe', 'France', 'FR'], ['Europe', 'Grèce', 'GR'],
    ['Europe', 'Irlande', 'IE'], ['Europe', 'Italie', 'IT'], ['Europe', 'Norvège', 'NO'],
    ['Europe', 'Pays-Bas', 'NL'], ['Europe', 'Portugal', 'PT'], ['Europe', 'Suisse', 'CH'],
  ],
  ...[
    ['Océanie', 'Australie', 'AU'], ['Océanie', 'Fidji', 'FJ'], ['Océanie', 'Guam', 'GU'],
    ['Océanie', 'Îles Cook', 'CK'], ['Océanie', 'Îles Mariannes du Nord', 'MP'], ['Océanie', 'Kiribati', 'KI'],
    ['Océanie', 'Micronésie', 'FM'], ['Océanie', 'Nauru', 'NR'], ['Océanie', 'Nouvelle-Calédonie', 'NC'],
    ['Océanie', 'Nouvelle-Zélande', 'NZ'], ['Océanie', 'Palaos', 'PW'], ['Océanie', 'Papouasie-Nouvelle-Guinée', 'PG'],
    ['Océanie', 'Samoa', 'WS'], ['Océanie', 'Tonga', 'TO'], ['Océanie', 'Vanuatu', 'VU'],
  ],
  ...[
    ['Europe/Asie', 'Arménie', 'AM'], ['Europe/Asie', 'Azerbaïdjan', 'AZ'], ['Europe/Asie', 'Chypre', 'CY'],
    ['Europe/Asie', 'Géorgie', 'GE'], ['Europe/Asie', 'Kazakhstan', 'KZ'], ['Europe/Asie', 'Kirghizistan', 'KG'],
    ['Europe/Asie', 'Mongolie', 'MN'], ['Europe/Asie', 'Ouzbékistan', 'UZ'], ['Europe/Asie', 'Russie', 'RU'],
    ['Europe/Asie', 'Tadjikistan', 'TJ'], ['Europe/Asie', 'Turquie', 'TR'], ['Europe/Asie', 'Turkménistan', 'TM'],
    ['Europe/Asie', 'Ukraine', 'UA'], ['Europe/Asie', 'Pakistan', 'PK'], ['Europe/Asie', 'Népal', 'NP'],
  ],
].map(([continent, country, countryCode]) => ({ continent, country, countryCode }));

const PLANS: EsimPlan[] = COUNTRY_DEFINITIONS.flatMap(({ continent, country, countryCode }) => {
  const prefix = countryCode.toLowerCase();
  return [
    { id: `${prefix}-5gb-15d`, continent, country, countryCode, provider: 'Voya eSIM', dataMb: 5120, durationDays: 15, price: 8.99, currency: 'EUR' },
    { id: `${prefix}-10gb-30d`, continent, country, countryCode, provider: 'Voya eSIM', dataMb: 10240, durationDays: 30, price: 14.99, currency: 'EUR' },
    { id: `${prefix}-20gb-30d`, continent, country, countryCode, provider: 'Voya eSIM', dataMb: 20480, durationDays: 30, price: 22.99, currency: 'EUR' },
  ];
});

@Injectable()
export class EsimService {
  constructor(
    @InjectRepository(EsimOrder)
    private readonly orderRepository: Repository<EsimOrder>,
    private readonly paymentService: PaymentService,
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

    const orderId = randomUUID();
    await this.paymentService.charge({
      userId: dto.userId,
      serviceType: 'ESIM',
      serviceId: orderId,
      amount: plan.price,
      currency: plan.currency,
      method: dto.paymentMethod,
    });
    const activationCode = `LPA:1$sm-voya.example$${randomBytes(12).toString('hex')}`;
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
      activationCode,
      qrCodeDataUrl: await QRCode.toDataURL(activationCode),
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
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value ?? '');
}
