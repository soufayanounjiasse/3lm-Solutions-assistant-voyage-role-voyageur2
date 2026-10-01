import { Voyage, Reservation, DocumentItem, User, UserPreferences, TransportBooking, TransportDriver, TransportBookingStatus, HotelRecommendation, MarketplaceOffer, Wallet, PaymentReceipt, TravelWallet } from '../types';
import { getCached, setCached } from './cache'

export const API_BASE_URL = 'http://localhost:3000';
//export const API_BASE_URL = 'http://10.87.218.69:8082';

export type MapPlace = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  types: string[];
  rating?: number;
};

export async function searchMapPlaces(query: string, coordinates?: { latitude: number; longitude: number }): Promise<MapPlace[]> {
  const params = new URLSearchParams({ query });
  if (coordinates) {
    params.set('latitude', String(coordinates.latitude));
    params.set('longitude', String(coordinates.longitude));
  }
  const res = await fetch(`${API_BASE_URL}/maps/places?${params.toString()}`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

async function readError(res: Response): Promise<string> {
  const error = await res.json().catch(() => ({}));
  return Array.isArray(error.message) ? error.message.join(', ') : error.message ?? `Erreur serveur (${res.status})`;
}

export async function login(payload: { identifiant: string; password: string }): Promise<{ user: User; accessToken: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function socialLogin(payload: {
  provider: 'GOOGLE' | 'APPLE' | 'FACEBOOK';
  providerUserId: string;
  email?: string;
  prenom?: string;
  nom?: string;
}): Promise<{ user: User; accessToken: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/social-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function register(payload: { email?: string; telephone?: string; password: string; prenom: string; nom: string }): Promise<{ user: User; accessToken: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export type AssistantMessage = { role: 'user' | 'assistant'; content: string };

export async function chatAssistant(message: string, history: AssistantMessage[] = []): Promise<{ reply: string }> {
  const res = await fetch(`${API_BASE_URL}/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function chatWithAssistant(message: string, history: AssistantMessage[] = []): Promise<{ reply: string }> {
  return chatAssistant(message, history);
}

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

export type PaymentMethod = 'CARD' | 'MOBILE' | 'WALLET';

export type EsimOrder = Omit<EsimPlan, 'continent' | 'countryCode'> & {
  id: string;
  userId: string;
  status: 'CONFIRMED' | 'ACTIVATED';
  activationCode: string;
  qrCodeDataUrl: string;
  dataUsedMb: number;
  paymentMethod: PaymentMethod;
};

export async function fetchEsimPlans(): Promise<EsimPlan[]> {
  const res = await fetch(`${API_BASE_URL}/esims/plans`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function fetchEsimOrders(userId: string): Promise<EsimOrder[]> {
  const res = await fetch(`${API_BASE_URL}/esims/orders?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function purchaseEsim(userId: string, planId: string, paymentMethod: PaymentMethod): Promise<EsimOrder> {
  const res = await fetch(`${API_BASE_URL}/esims/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, planId, paymentMethod }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function activateEsim(orderId: string): Promise<EsimOrder> {
  const res = await fetch(`${API_BASE_URL}/esims/orders/${orderId}/activate`, { method: 'PATCH' });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function fetchHotelRecommendations(params: {
  location?: string;
  maxBudget: number;
  travelers?: number;
  preferences?: string[];
}): Promise<HotelRecommendation[]> {
  const search = new URLSearchParams({
    maxBudget: String(params.maxBudget),
    ...(params.location ? { location: params.location } : {}),
    ...(params.travelers ? { travelers: String(params.travelers) } : {}),
    ...(params.preferences && params.preferences.length > 0 ? { preferences: params.preferences.join(',') } : {}),
  });
  const res = await fetch(`${API_BASE_URL}/hotels/recommendations?${search.toString()}`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function fetchMarketplaceOffers(params: {
  category?: string;
  maxPrice?: number;
  search?: string;
}): Promise<MarketplaceOffer[]> {
  const search = new URLSearchParams({
    ...(params.category ? { category: params.category } : {}),
    ...(params.maxPrice ? { maxPrice: String(params.maxPrice) } : {}),
    ...(params.search ? { search: params.search } : {}),
  });
  const res = await fetch(`${API_BASE_URL}/marketplace/offers?${search.toString()}`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function fetchEmergencyContacts(): Promise<MarketplaceOffer[]> {
  const res = await fetch(`${API_BASE_URL}/marketplace/emergency`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function fetchProfile(token: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function updateProfile(token: string, userId: string, payload: Partial<Pick<User, 'prenom' | 'nom' | 'email' | 'telephone'>>): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/users/${userId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function fetchPreferences(token: string, userId: string): Promise<UserPreferences> {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/preferences`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function updatePreferences(token: string, userId: string, payload: Partial<UserPreferences>): Promise<UserPreferences> {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/preferences`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function changePassword(token: string, userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function fetchVoyages(statut?: string): Promise<Voyage[]> {
  const cacheKey = `voyages_${statut ?? 'all'}`;
  try {
    const url = statut
      ? `${API_BASE_URL}/voyages?statut=${statut}`
      : `${API_BASE_URL}/voyages`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
    const data: Voyage[] = await res.json();
    await setCached(cacheKey, data);
    return data;
  } catch (e) {
    const cached = await getCached<Voyage[]>(cacheKey);
    if (cached) return cached;
    throw e;
  }
}

export async function fetchVoyageById(id: string): Promise<Voyage> {
  const cacheKey = `voyage_${id}`;
  try {
    const res = await fetch(`${API_BASE_URL}/voyages/${id}`);
    if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
    const data: Voyage = await res.json();
    await setCached(cacheKey, data);
    return data;
  } catch (e) {
    const cached = await getCached<Voyage>(cacheKey);
    if (cached) return cached;
    throw e;
  }
}

export async function fetchReservation(id: string): Promise<Reservation> {
  const cacheKey = `reservation_${id}`;
  try {
    const res = await fetch(`${API_BASE_URL}/reservation/${id}`);
    if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
    const data: Reservation = await res.json();
    await setCached(cacheKey, data);
    return data;
  } catch (e) {
    const cached = await getCached<Reservation>(cacheKey);
    if (cached) return cached;
    throw e;
  }
}

export async function fetchDocument(id: string): Promise<DocumentItem> {
  const cacheKey = `document_${id}`;
  try {
    const res = await fetch(`${API_BASE_URL}/document/${id}`);
    if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
    const data: DocumentItem = await res.json();
    await setCached(cacheKey, data);
    return data;
  } catch (e) {
    const cached = await getCached<DocumentItem>(cacheKey);
    if (cached) return cached;
    throw e;
  }
}

export async function uploadDocument(
  voyageId: string,
  type: string,
  file: { uri: string; name: string; mimeType: string },
): Promise<DocumentItem> {
  const formData = new FormData();
  const { Platform } = require('react-native');

  if (Platform.OS === 'web') {
    const response = await fetch(file.uri);
    const blob = await response.blob();
    formData.append('file', blob, file.name);
  } else {
    // @ts-ignore
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
    });
  }
  formData.append('type', type);

  const res = await fetch(`${API_BASE_URL}/voyages/${voyageId}/document/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message ?? `Erreur serveur (${res.status})`);
  }
  return res.json();
}

export async function createVoyage(payload: {
  userId: string;
  destination: string;
  dateDebut: string;
  dateFin: string;
}): Promise<Voyage> {
  const res = await fetch(`${API_BASE_URL}/voyages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message.join(', ') : err.message;
    throw new Error(message ?? `Erreur serveur (${res.status})`);
  }
  return res.json();
}

export async function createReservation(
  voyageId: string,
  payload: {
    type: string;
    fournisseur: string;
    reference: string;
    dateDebut: string;
    dateFin?: string;
  },
): Promise<Reservation> {
  const res = await fetch(`${API_BASE_URL}/voyages/${voyageId}/reservation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message.join(', ') : err.message;
    throw new Error(message ?? `Erreur serveur (${res.status})`);
  }
  return res.json();
}

export async function updateReservation(
  id: string,
  payload: Partial<{
    type: string;
    fournisseur: string;
    reference: string;
    statut: string;
    dateDebut: string;
    dateFin: string;
  }>,
): Promise<Reservation> {
  const res = await fetch(`${API_BASE_URL}/reservation/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Erreur serveur (${res.status})`);
  }
  return res.json();
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/document/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Erreur serveur (${res.status})`);
  }
}

export async function fetchTransportDrivers(): Promise<TransportDriver[]> {
  const res = await fetch(`${API_BASE_URL}/transport/drivers`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function fetchTransportBookings(userId: string): Promise<TransportBooking[]> {
  const res = await fetch(`${API_BASE_URL}/transport/bookings?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function createTransportBooking(payload: {
  userId: string;
  driverId: string;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledAt: string;
}): Promise<TransportBooking> {
  const res = await fetch(`${API_BASE_URL}/transport/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function updateTransportBooking(id: string, payload: { status?: TransportBookingStatus; rating?: number; ratingComment?: string }): Promise<TransportBooking> {
  const res = await fetch(`${API_BASE_URL}/transport/bookings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function fetchPaymentReceipts(userId: string): Promise<PaymentReceipt[]> {
  const res = await fetch(`${API_BASE_URL}/payments/receipts?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function fetchTravelWallet(userId: string): Promise<TravelWallet> {
  const res = await fetch(`${API_BASE_URL}/payments/wallet?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function savePaymentPreference(userId: string, method: PaymentMethod): Promise<TravelWallet> {
  const res = await fetch(`${API_BASE_URL}/payments/wallet/method`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, method }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function fetchWallet(voyageId: string): Promise<Wallet> {
  const cacheKey = `wallet_${voyageId}`;
  try {
    const res = await fetch(`${API_BASE_URL}/wallet/voyages/${voyageId}`);
    if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
    const data: Wallet = await res.json();
    await setCached(cacheKey, data);
    return data;
  } catch (error) {
    const cached = await getCached<Wallet>(cacheKey);
    if (cached) return cached;
    throw error;
  }
}

export async function fetchPaymentWallet(userId: string): Promise<TravelWallet> {
  const res = await fetch(`${API_BASE_URL}/payments/wallet?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function topUpPaymentWallet(userId: string, amount: number, currency = 'EUR'): Promise<TravelWallet> {
  const res = await fetch(`${API_BASE_URL}/payments/wallet/top-up`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, amount, currency }) });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}
export async function chargePayment(payload: {
  userId: string;
  serviceType: string;
  serviceId: string;
  amount: number;
  currency: string;
  method: 'CARD' | 'MOBILE' | 'WALLET';
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}