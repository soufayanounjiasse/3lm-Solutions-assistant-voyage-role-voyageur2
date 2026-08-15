import { Voyage, Reservation, DocumentItem } from '../types';

export const API_BASE_URL = 'http://localhost:3000';

export async function fetchVoyages(statut?: string): Promise<Voyage[]> {
  const url = statut
    ? `${API_BASE_URL}/voyages?statut=${statut}`
    : `${API_BASE_URL}/voyages`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
  return res.json();
}

export async function fetchVoyageById(id: string): Promise<Voyage> {
  const res = await fetch(`${API_BASE_URL}/voyages/${id}`);
  if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
  return res.json();
}

export async function fetchReservation(id: string): Promise<Reservation> {
  const res = await fetch(`${API_BASE_URL}/reservation/${id}`);
  if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
  return res.json();
}

export async function fetchDocument(id: string): Promise<DocumentItem> {
  const res = await fetch(`${API_BASE_URL}/document/${id}`);
  if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
  return res.json();
}

export async function uploadDocument(
  voyageId: string,
  type: string,
  file: { uri: string; name: string; mimeType: string },
): Promise<DocumentItem> {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    // Sur le web, il faut un vrai Blob, pas juste un objet {uri, name, type}
    const response = await fetch(file.uri);
    const blob = await response.blob();
    formData.append('file', blob, file.name);
  } else {
    // @ts-ignore - React Native natif accepte ce format d'objet pour FormData
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
    // Ne JAMAIS fixer manuellement 'Content-Type' ici : le navigateur/RN
    // doit générer lui-même le boundary multipart, sinon le serveur ne
    // peut pas parser le fichier (d'où le 400 Bad Request).
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message ?? `Erreur serveur (${res.status})`);
  }
  return res.json();
}