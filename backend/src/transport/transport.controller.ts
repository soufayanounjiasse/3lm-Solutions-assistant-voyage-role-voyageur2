import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateTransportBookingDto } from './dto/create-transport-booking.dto';
import { UpdateTransportBookingDto } from './dto/update-transport-booking.dto';
import { TransportService } from './transport.service';

@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @Get('drivers')
  drivers(@Query('available') available = 'true') {
    return this.transportService.listDrivers(available !== 'false');
  }

  @Post('bookings')
  createBooking(@Body() dto: CreateTransportBookingDto) {
    return this.transportService.createBooking(dto);
  }

  @Get('bookings')
  bookings(@Query('userId') userId: string) {
    return this.transportService.listBookings(userId);
  }

  @Patch('bookings/:id')
  updateBooking(@Param('id') id: string, @Body() dto: UpdateTransportBookingDto) {
    return this.transportService.updateBooking(id, dto);
  }
}