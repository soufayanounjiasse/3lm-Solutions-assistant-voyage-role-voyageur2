import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';

@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('offers')
  offers(
    @Query('category') category?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('search') search?: string,
  ) {
    return this.marketplaceService.listOffers({
      category,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      search,
    });
  }

  @Get('emergency')
  emergency() {
    return this.marketplaceService.listEmergencyContacts();
  }
}
