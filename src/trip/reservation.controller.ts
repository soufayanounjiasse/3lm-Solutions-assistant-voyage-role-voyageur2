import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@ApiTags('reservation')
@Controller()
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post('voyages/:voyageId/reservation')
  create(@Param('voyageId') voyageId: string, @Body() dto: CreateReservationDto) {
    return this.reservationService.create(voyageId, dto);
  }

  @Get('voyages/:voyageId/reservation')
  findAllByVoyage(@Param('voyageId') voyageId: string) {
    return this.reservationService.findAllByVoyage(voyageId);
  }

  @Get('reservation/:id')
  findOne(@Param('id') id: string) {
    return this.reservationService.findOne(id);
  }

  @Patch('reservation/:id')
  update(@Param('id') id: string, @Body() dto: UpdateReservationDto) {
    return this.reservationService.update(id, dto);
  }

  @Delete('reservation/:id')
  remove(@Param('id') id: string) {
    return this.reservationService.remove(id);
  }
}