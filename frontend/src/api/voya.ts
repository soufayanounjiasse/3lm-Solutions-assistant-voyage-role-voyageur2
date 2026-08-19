import { Voyage, Reservation, DocumentItem } from '../types';
import { getCached, setCached } from './cache';

export const API_BASE_URL = 'http://localhost:3000';

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