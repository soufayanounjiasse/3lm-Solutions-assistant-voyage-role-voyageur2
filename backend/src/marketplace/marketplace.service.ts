import { Injectable } from '@nestjs/common';

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

export type MarketplaceFilters = {
  category?: string;
  maxPrice?: number;
  search?: string;
};

const OFFERS: MarketplaceOffer[] = [
  {
    id: 'guide-1',
    name: 'Guide local historique',
    category: 'tourism',
    price: 42,
    currency: 'EUR',
    rating: 4.9,
    badge: 'Guide vérifié',
    isVerified: true,
    verificationStatus: 'Vérifié',
    description: 'Excursion guidée en ville, parfaite pour découvrir les lieux emblématiques.',
  },
  {
    id: 'translator-1',
    name: 'Traducteur professionnel',
    category: 'personal',
    price: 65,
    currency: 'EUR',
    rating: 4.8,
    badge: 'Très demandé',
    isVerified: true,
    verificationStatus: 'Vérifié',
    description: 'Assistance linguistique pour les déplacements et les échanges locaux.',
  },
  {
    id: 'medical-1',
    name: 'Urgence médicale',
    category: 'emergency',
    price: 0,
    currency: 'EUR',
    rating: 5,
    badge: 'Urgence',
    isVerified: true,
    verificationStatus: 'Vérifié',
    description: 'Contact médical d’urgence fiable, disponible rapidement en cas de besoin.',
    contact: '+33 112',
  },
  {
    id: 'restaurant-1',
    name: 'Dîner local premium',
    category: 'lifestyle',
    price: 35,
    currency: 'EUR',
    rating: 4.7,
    badge: 'Populaire',
    isVerified: true,
    verificationStatus: 'Vérifié',
    description: 'Expérience culinaire locale, recommandée pour un moment détente.',
  },
  {
    id: 'photographer-1',
    name: 'Photographe voyage',
    category: 'personal',
    price: 80,
    currency: 'EUR',
    rating: 4.6,
    badge: 'Top rating',
    isVerified: true,
    verificationStatus: 'Vérifié',
    description: 'Séance photo premium pour mémoriser les meilleurs souvenirs du voyage.',
  },
  {
    id: 'event-1',
    name: 'Soirée locale',
    category: 'lifestyle',
    price: 28,
    currency: 'EUR',
    rating: 4.5,
    badge: 'À vivre',
    isVerified: true,
    verificationStatus: 'Vérifié',
    description: 'Activité culturelle et festive, sélectionnée par notre équipe locale.',
  },
];

@Injectable()
export class MarketplaceService {
  listOffers(filters: MarketplaceFilters = {}): MarketplaceOffer[] {
    const category = filters.category?.trim().toLowerCase();
    const search = filters.search?.trim().toLowerCase();
    const maxPrice = Number(filters.maxPrice ?? Number.MAX_SAFE_INTEGER);

    return OFFERS.filter((offer) => {
      if (category && offer.category.toLowerCase() !== category) return false;
      if (Number.isFinite(maxPrice) && Number(offer.price ?? 0) > maxPrice) return false;
      if (search && !offer.name.toLowerCase().includes(search) && !offer.description.toLowerCase().includes(search) && !offer.category.toLowerCase().includes(search)) return false;
      return true;
    }).sort((a, b) => b.rating - a.rating || Number(a.price ?? 0) - Number(b.price ?? 0));
  }

  listEmergencyContacts(): MarketplaceOffer[] {
    return OFFERS.filter((offer) => offer.category === 'emergency' && offer.isVerified).sort((a, b) => b.rating - a.rating);
  }
}
