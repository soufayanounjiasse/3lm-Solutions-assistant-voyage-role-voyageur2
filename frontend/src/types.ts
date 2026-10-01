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

export type Wallet = {
  voyage: Voyage;
  reservations: Reservation[];
  documents: DocumentItem[];
  esims: Array<{ id: string; country: string; dataMb: number; dataUsedMb: number; status: string }>;
};

export type PaymentMethod = 'CARD' | 'MOBILE' | 'WALLET';
export type TravelWallet = { id: string; userId: string; balance: number; currency: string; preferredMethod: PaymentMethod };
export type PaymentReceipt = { id: string; userId: string; serviceType: string; serviceId: string; amount: number; currency: string; method: PaymentMethod; status: 'PAID' | 'FAILED'; receiptNumber: string; createdAt: string };

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
export type TransportDriver = {
  id: string;
  name: string;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePlate: string;
  rating: number;
  pricePerKm: number;
  isAvailable: boolean;
};

export type TransportBookingStatus = 'CONFIRMED' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED';

export type TransportBooking = {
  id: string;
  userId: string;
  driverId: string;
  driver: TransportDriver;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledAt: string;
  price: number;
  status: TransportBookingStatus;
  rating?: number;
  ratingComment?: string;
};
export type HotelRecommendation = {
  id: string;
  name: string;
  location: string;
  rating: number;
  nightPrice: number;
  currency: string;
  tags: string[];
  justification: string;
};

export type MarketplaceOffer = {
  id: string;
  name: string;
  category: 'tourism' | 'personal' | 'emergency' | 'lifestyle';
  price?: number;
  currency?: string;
  rating: number;
  badge: string;
  isVerified: boolean;
  verificationStatus: 'Vérifié' | 'En vérification';
  description: string;
  contact?: string;
};

export type RootStackParamList = {
  Preferences: undefined;
  Assistant: undefined;
  Esim: undefined;
  Hotel: undefined;
  Marketplace: undefined;
  Emergency: undefined;
  Transport: undefined;
  SettingsList: undefined;
  ProfileDetail: undefined;
  Language: undefined;
  Onboarding: undefined;
  MainMenu: undefined;
  Unavailable: { title: string };
  SelectVoyageForReservation: undefined;
  VoyagesList: { mode?: 'wallet' } | undefined;
  Wallet: { voyageId: string; destination: string };
  Payment: {
  serviceLabel: string;
  serviceProvider: string;
  items: { label: string; amount: number }[];
  total: number;
  currency: string;
  serviceType: string;
  serviceId: string;
};
  Dashboard: { voyageId: string };
  Maps: { destination: string };
  Reservations: { voyageId: string; destination: string };
  ReservationDetail: { reservationId: string };
  Documents: { voyageId: string; destination: string };
  DocumentDetail: { documentId: string };
  Profile: undefined;
  Login: undefined;
Register: undefined;
};