import { Injectable } from '@nestjs/common';

export type HotelRecommendationInput = {
  location: string;
  maxBudget: number;
  travelers?: number;
  preferences?: string[];
};

export type HotelRecommendation = {
  id: string;
  name: string;
  location: string;
  district: string;
  rating: number;
  nightPrice: number;
  currency: string;
  tags: string[];
  justification: string;
  isRecommended: boolean;
};

const HOTELS: Omit<HotelRecommendation, 'isRecommended'>[] = [
  {
    id: 'hotel-paris-1', name: 'Hôtel Le Marais', location: 'Paris', district: 'Le Marais',
    rating: 4.7, nightPrice: 92, currency: 'EUR',
    tags: ['famille', 'enfants', 'petit-déjeuner inclus'],
    justification: 'Adapté aux familles avec enfants et reste sous le budget maximal.',
  },
  {
    id: 'hotel-paris-2', name: 'Résidence Bastille', location: 'Paris', district: 'Bastille',
    rating: 4.4, nightPrice: 78, currency: 'EUR',
    tags: ['kitchenette', 'budget', 'calme'],
    justification: 'Très bon rapport qualité-prix pour un séjour en famille.',
  },
  {
    id: 'hotel-paris-3', name: 'Lumière Sud', location: 'Paris', district: 'Saint-Germain',
    rating: 4.8, nightPrice: 118, currency: 'EUR',
    tags: ['design', 'spa', 'adultes'],
    justification: 'Idéal pour une escapade plus premium, mais au-dessus du budget cible.',
  },
  {
    id: 'hotel-lyon-1', name: 'Hôtel des Étoiles', location: 'Lyon', district: 'Presqu\'île',
    rating: 4.4, nightPrice: 85, currency: 'EUR',
    tags: ['famille', 'transport', 'budget'],
    justification: 'Adapté aux familles et bien connecté aux transports.',
  },
  {
    id: 'hotel-marseille-1', name: 'Azur Family Suites', location: 'Marseille', district: 'Prado',
    rating: 4.6, nightPrice: 96, currency: 'EUR',
    tags: ['famille', 'enfants', 'plage'],
    justification: 'Connu pour son accueil familial et sa proximité de la plage.',
  },
];

@Injectable()
export class HotelService {
  recommendHotels(input: HotelRecommendationInput): HotelRecommendation[] {
    const location = input.location?.trim().toLowerCase();
    const maxBudget = Number(input.maxBudget ?? 0);
    const preferences = (input.preferences ?? []).map((pref) => pref.toLowerCase());

    const filtered = HOTELS.filter((hotel) => {
      if (location && !hotel.location.toLowerCase().includes(location)) return false;
      if (Number.isFinite(maxBudget) && maxBudget > 0 && hotel.nightPrice > maxBudget) return false;
      return true;
    }).map((hotel) => {
      const matchedPreferences = preferences.filter((pref) =>
        hotel.tags.some((tag) => tag.toLowerCase().includes(pref)),
      );
      const scores = {
        budget: hotel.nightPrice <= maxBudget ? 1 : 0,
        family: hotel.tags.some((tag) => ['famille', 'enfants', 'kids'].includes(tag.toLowerCase())) ? 1 : 0,
        preferenceMatch: matchedPreferences.length > 0 ? 1 : 0,
      };
      const sortScore = Object.values(scores).reduce((total, value) => total + value, 0);
      return {
        ...hotel,
        justification:
          matchedPreferences.length > 0
            ? `Adapté pour ${matchedPreferences.join(', ')} et conforme au budget maximal.`
            : hotel.justification,
        rating: Number((hotel.rating + sortScore * 0.1).toFixed(1)),
        _sortScore: sortScore,
      };
    });

    const sorted = filtered.sort(
      (a, b) => b._sortScore - a._sortScore || a.nightPrice - b.nightPrice || b.rating - a.rating,
    );

    return sorted.map(({ _sortScore, ...hotel }, index) => ({
      ...hotel,
      isRecommended: index === 0, // Le meilleur résultat trié est mis en avant, comme sur la maquette.
    }));
  }
}