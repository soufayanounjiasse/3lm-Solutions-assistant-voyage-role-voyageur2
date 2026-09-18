export type EsimProviderPlan = {
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

export type EsimProviderOrderResult = {
  externalOrderId: string;
  activationCode: string;
  qrCodeDataUrl: string;
};

export type EsimProviderUsage = {
  dataUsedMb: number;
};

export type EsimUsageQuery = {
  externalOrderId: string;
  dataMb: number;
  activatedAt: Date | null;
};

export interface EsimProvider {
  listPlans(country?: string): Promise<EsimProviderPlan[]>;
  submitOrder(plan: EsimProviderPlan): Promise<EsimProviderOrderResult>;
  getUsage(query: EsimUsageQuery): Promise<EsimProviderUsage>;
}

export const ESIM_PROVIDER = 'ESIM_PROVIDER';