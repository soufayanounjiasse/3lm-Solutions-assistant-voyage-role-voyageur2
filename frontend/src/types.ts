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

export type RootStackParamList = {
  Dashboard: undefined;
  Reservations: { voyageId: string; destination: string };
  ReservationDetail: { reservationId: string };
  Documents: { voyageId: string; destination: string };
  DocumentDetail: { documentId: string };
};