import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import QRCode from 'qrcode';
import { EsimProvider, EsimProviderPlan, EsimProviderOrderResult, EsimProviderUsage, EsimUsageQuery } from './esim-provider.interface';
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

const PLANS: EsimProviderPlan[] = COUNTRY_DEFINITIONS.flatMap(({ continent, country, countryCode }) => {
  const prefix = countryCode.toLowerCase();
  return [
    { id: `${prefix}-5gb-15d`, continent, country, countryCode, provider: 'Voya eSIM (simulé)', dataMb: 5120, durationDays: 15, price: 8.99, currency: 'EUR' },
    { id: `${prefix}-10gb-30d`, continent, country, countryCode, provider: 'Voya eSIM (simulé)', dataMb: 10240, durationDays: 30, price: 14.99, currency: 'EUR' },
    { id: `${prefix}-20gb-30d`, continent, country, countryCode, provider: 'Voya eSIM (simulé)', dataMb: 20480, durationDays: 30, price: 22.99, currency: 'EUR' },
  ];
});

// Simule une consommation qui augmente avec le temps depuis l'activation,
// en attendant les vraies notifications d'usage de l'agrégateur (webhook Airalo).
function simulateUsage(activatedAt: Date | null, dataMb: number): number {
  if (!activatedAt) return 0;
  const hoursSinceActivation = Math.max(0, (Date.now() - activatedAt.getTime()) / (1000 * 60 * 60));
  const simulatedMb = Math.round(hoursSinceActivation * (dataMb / 72)); // épuisé en ~72h d'usage simulé
  return Math.min(simulatedMb, dataMb);
}

@Injectable()
export class MockEsimProvider implements EsimProvider {
  async listPlans(country?: string): Promise<EsimProviderPlan[]> {
    if (!country) return PLANS;
    const normalized = country.trim().toLowerCase();
    return PLANS.filter(
      (plan) => plan.country.toLowerCase().includes(normalized) || plan.countryCode.toLowerCase() === normalized,
    );
  }

  async submitOrder(plan: EsimProviderPlan): Promise<EsimProviderOrderResult> {
    const activationCode = `LPA:1$sm-voya-mock.example$${randomBytes(12).toString('hex')}`;
    return {
      externalOrderId: `mock-${Date.now()}`,
      activationCode,
      qrCodeDataUrl: await QRCode.toDataURL(activationCode),
    };
  }

 async getUsage(query: EsimUsageQuery): Promise<EsimProviderUsage> {
  return { dataUsedMb: simulateUsage(query.activatedAt, query.dataMb) };
}

}