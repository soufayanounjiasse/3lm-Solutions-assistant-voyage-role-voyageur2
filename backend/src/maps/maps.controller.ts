import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { MapsService } from './maps.service';

@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get('places')
  places(
    @Query('query') query: string,
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('radius') radius?: string,
  ) {
    if (!query?.trim() || query.trim().length > 200) {
      throw new BadRequestException('Une recherche de 1 à 200 caractères est requise.');
    }

    const coordinates = latitude !== undefined || longitude !== undefined
      ? { latitude: Number(latitude), longitude: Number(longitude) }
      : undefined;
    if (coordinates && (
      !Number.isFinite(coordinates.latitude) || coordinates.latitude < -90 || coordinates.latitude > 90 ||
      !Number.isFinite(coordinates.longitude) || coordinates.longitude < -180 || coordinates.longitude > 180
    )) {
      throw new BadRequestException('Les coordonnées sont invalides.');
    }

    const radiusMeters = radius === undefined ? undefined : Number(radius);
    if (radiusMeters !== undefined && (!Number.isFinite(radiusMeters) || radiusMeters < 1 || radiusMeters > 50000)) {
      throw new BadRequestException('Le rayon doit être compris entre 1 et 50000 mètres.');
    }

    return this.mapsService.searchPlaces(query.trim(), coordinates, radiusMeters);
  }
}