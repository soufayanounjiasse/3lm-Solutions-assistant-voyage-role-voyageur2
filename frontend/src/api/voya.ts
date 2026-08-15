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