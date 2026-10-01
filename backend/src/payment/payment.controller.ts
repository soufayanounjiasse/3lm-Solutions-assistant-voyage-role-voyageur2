import { Body, Controller, Get, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { TopUpWalletDto } from './dto/top-up-wallet.dto';
import { UpdatePaymentPreferenceDto } from './dto/update-payment-preference.dto';
import { PaymentService } from './payment.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  charge(@Body() dto: CreatePaymentDto) {
    return this.paymentService.charge(dto);
  }

  @Get('receipts')
  receipts(@Query('userId', new ParseUUIDPipe()) userId: string) {
    return this.paymentService.listReceipts(userId);
  }

  @Get('wallet')
  wallet(@Query('userId', new ParseUUIDPipe()) userId: string) {
    return this.paymentService.getWallet(userId);
  }

  @Post('wallet/top-up')
  topUpWallet(@Body() dto: TopUpWalletDto) {
    return this.paymentService.topUpWallet(dto);
  }

  @Patch('wallet/method')
  updatePaymentPreference(@Body() dto: UpdatePaymentPreferenceDto) {
    return this.paymentService.updatePreference(dto);
  }
}