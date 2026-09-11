import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateEsimOrderDto } from './dto/create-esim-order.dto';
import { UpdateEsimUsageDto } from './dto/update-esim-usage.dto';
import { EsimService } from './esim.service';

@ApiTags('esim')
@Controller('esims')
export class EsimController {
  constructor(private readonly esimService: EsimService) {}

  @Get('plans')
  plans(@Query('country') country?: string) {
    return this.esimService.listPlans(country);
  }

  @Post('orders')
  createOrder(@Body() dto: CreateEsimOrderDto) {
    return this.esimService.createOrder(dto);
  }

  @Get('orders')
  orders(@Query('userId') userId: string) {
    return this.esimService.listOrders(userId);
  }

  @Get('orders/:id')
  order(@Param('id') id: string) {
    return this.esimService.getOrder(id);
  }

  @Patch('orders/:id/activate')
  activate(@Param('id') id: string) {
    return this.esimService.activate(id);
  }

  @Post('orders/:id/usage')
  updateUsage(@Param('id') id: string, @Body() dto: UpdateEsimUsageDto) {
    return this.esimService.updateUsage(id, dto);
  }
}
