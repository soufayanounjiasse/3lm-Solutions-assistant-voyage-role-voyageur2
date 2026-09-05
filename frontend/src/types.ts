export type Reservation = {
  id: string;
  voyageId: string;
  type: string;
  fournisseur: string;
  reference: string;
  statut: string;
  dateDebut: string;
  dateFin?: string;
};

export type DocumentItem = {
  id: string;
  voyageId: string;
  type: string;
  nomFichier: string;
  urlS3: string;
  dateAjout: string;
};

export type Voyage = {
  id: string;
  destination: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  reservations: Reservation[];
  documents: DocumentItem[];
};

export type User = {
  id: string;
  email?: string;
  telephone?: string;
  prenom: string;
  nom: string;
  photoUrl?: string;
  langue: string;
  statut: string;
};

export type UserPreferences = {
  id?: string;
  userId: string;
  budgetMin?: number | string;
  budgetMax?: number | string;
  centresInteret: string[];
  typeVoyage?: 'AFFAIRES' | 'TOURISME' | 'FAMILLE' | 'ETUDIANT';
};
export type RootStackParamList = {
  SettingsList: undefined;
  ProfileDetail: undefined;
  Language: undefined;
  Onboarding: undefined;
  MainMenu: undefined;
  Unavailable: { title: string };
  SelectVoyageForReservation: undefined;
  VoyagesList: undefined;
  Dashboard: { voyageId: string };
  Reservations: { voyageId: string; destination: string };
  ReservationDetail: { reservationId: string };
  Documents: { voyageId: string; destination: string };
  DocumentDetail: { documentId: string };
  Profile: undefined;
  Login: undefined;
  Register: undefined;
};