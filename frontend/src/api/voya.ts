import { Voyage, Reservation, DocumentItem, User, UserPreferences } from '../types';
import { getCached, setCached } from './cache'

export const API_BASE_URL = 'http://localhost:3000';
//export const API_BASE_URL = 'http://10.87.218.69:8082';

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