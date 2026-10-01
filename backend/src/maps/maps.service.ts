import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type Coordinates = { latitude: number; longitude: number };
type GooglePlace = {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  types?: string[];
  rating?: number;
};

@Injectable()
export class MapsService {
  constructor(private readonly config: ConfigService) {}

  async searchPlaces(query: string, center?: Coordinates, radius?: number) {
    const apiKey = this.config.get<string>('MAPS_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('La recherche cartographique est indisponible.');
    }

    const locationBias = center ? {
      circle: {
        center: { latitude: center.latitude, longitude: center.longitude },
        radius: radius ?? 10000,
      },
    } : undefined;
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.rating',
      },
      body: JSON.stringify({ textQuery: query, ...(locationBias ? { locationBias } : {}) }),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException('Google Places ne répond pas pour le moment.');
    }

    const result = await response.json() as { places?: GooglePlace[] };
    return (result.places ?? []).flatMap((place) => {
      if (!place.location || !place.id) return [];
      return [{
        id: place.id,
        name: place.displayName?.text ?? 'Lieu sans nom',
        address: place.formattedAddress ?? '',
        latitude: place.location.latitude,
        longitude: place.location.longitude,
        types: place.types ?? [],
        rating: place.rating,
      }];
    });
  }
}