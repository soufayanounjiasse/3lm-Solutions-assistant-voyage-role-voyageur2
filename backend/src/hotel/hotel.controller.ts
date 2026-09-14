import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HotelService } from './hotel.service';

@ApiTags('hotel')
@Controller('hotels')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Get('recommendations')
  recommendations(
    @Query('location') location: string,
    @Query('maxBudget') maxBudget: string,
    @Query('travelers') travelers?: string,
    @Query('preferences') preferences?: string,
  ) {
    const parsedPreferences = preferences ? preferences.split(',').map((item) => item.trim()).filter(Boolean) : [];
    return this.hotelService.recommendHotels({
      location,
      maxBudget: Number(maxBudget ?? 0),
      travelers: travelers ? Number(travelers) : undefined,
      preferences: parsedPreferences,
    });
  }
}
