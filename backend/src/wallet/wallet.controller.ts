import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('voyages/:voyageId')
  getByVoyage(@Param('voyageId') voyageId: string) {
    return this.walletService.getByVoyage(voyageId);
  }
}
