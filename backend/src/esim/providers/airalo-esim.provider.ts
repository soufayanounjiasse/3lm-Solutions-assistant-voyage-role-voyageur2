import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EsimProvider, EsimProviderPlan, EsimProviderOrderResult, EsimProviderUsage, EsimUsageQuery } from './esim-provider.interface';
/**
 * Intégration réelle avec l'API partenaire Airalo.
 * Nécessite un accès partenaire approuvé par Airalo (client_id + client_secret),
 * obtenu via une demande commerciale côté 3LM Solutions.
 * Doc : https://developers.partners.airalo.com
 *
 * Ce provider est prêt structurellement mais NON ACTIVÉ tant que les
 * identifiants ne sont pas fournis (voir esim.module.ts et ESIM_PROVIDER dans .env).
 */
@Injectable()
export class AiraloEsimProvider implements EsimProvider {
  private readonly logger = new Logger(AiraloEsimProvider.name);
  private readonly baseUrl = 'https://partners-api.airalo.com/v2';
  private cachedToken: { value: string; expiresAt: number } | null = null;

  constructor(private readonly config: ConfigService) {}

  private getCredentials() {
    const clientId = this.config.get<string>('AIRALO_CLIENT_ID');
    const clientSecret = this.config.get<string>('AIRALO_CLIENT_SECRET');
    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException(
        "Intégration Airalo non configurée : AIRALO_CLIENT_ID / AIRALO_CLIENT_SECRET manquants (accès partenaire requis).",
      );
    }
    return { clientId, clientSecret };
  }

  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      return this.cachedToken.value;
    }
    const { clientId, clientSecret } = this.getCredentials();

    const res = await fetch(`${this.baseUrl}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    });
    if (!res.ok) {
      throw new ServiceUnavailableException(`Échec d'authentification Airalo : ${res.status}`);
    }
    const data = await res.json();
    // Le token est valide 24h ; on retire une marge de sécurité de 5 minutes.
    this.cachedToken = { value: data.access_token, expiresAt: Date.now() + (23.5 * 60 * 60 * 1000) };
    return this.cachedToken.value;
  }

  async listPlans(country?: string): Promise<EsimProviderPlan[]> {
    const token = await this.getAccessToken();
    const params = new URLSearchParams({ limit: '1000' });
    if (country) params.set('country', country);

    const res = await fetch(`${this.baseUrl}/packages?${params}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!res.ok) throw new ServiceUnavailableException(`Airalo listPlans a échoué : ${res.status}`);
    const data = await res.json();

    // TODO: adapter ce mapping à la forme exacte de la réponse Airalo une fois
    // l'accès sandbox obtenu (structure exacte à vérifier en conditions réelles).
    return (data.data ?? []).map((pkg: any) => ({
      id: pkg.id,
      continent: pkg.region ?? '',
      country: pkg.country ?? '',
      countryCode: pkg.country_code ?? '',
      provider: 'Airalo',
      dataMb: pkg.data_mb ?? 0,
      durationDays: pkg.validity_days ?? 0,
      price: pkg.price ?? 0,
      currency: pkg.currency ?? 'USD',
    }));
  }

  async submitOrder(plan: EsimProviderPlan): Promise<EsimProviderOrderResult> {
    const token = await this.getAccessToken();
    const res = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ package_id: plan.id, quantity: 1 }),
    });
    if (!res.ok) throw new ServiceUnavailableException(`Airalo submitOrder a échoué : ${res.status}`);
    const data = await res.json();

    // TODO: vérifier le nom exact des champs (iccid, qrcode_url, lpa) dans la doc
    // "Get eSIM" / "Install eSIM" une fois l'accès sandbox obtenu.
    return {
      externalOrderId: data.data?.id ?? data.id,
      activationCode: data.data?.qrcode ?? '',
      qrCodeDataUrl: data.data?.qrcode_url ?? '',
    };
  }

async getUsage(query: EsimUsageQuery): Promise<EsimProviderUsage> {
  const token = await this.getAccessToken();
  const res = await fetch(`${this.baseUrl}/sims/${query.externalOrderId}/usage`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!res.ok) throw new ServiceUnavailableException(`Airalo getUsage a échoué : ${res.status}`);
  const data = await res.json();
  return { dataUsedMb: data.data?.data_used_mb ?? 0 };
}

}