import {
  Controller, Get, Post, Put, Body, Param, Delete, Query,
} from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { TripService } from './trip.service';
import { CreateVoyageDto } from './dto/create-voyage.dto';
import { UpdateVoyageDto } from './dto/update-voyage.dto';

@ApiTags('voyages')
@Controller('voyages')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  create(@Body() createVoyageDto: CreateVoyageDto) {
    return this.tripService.create(createVoyageDto);
  }

  @ApiQuery({ name: 'userId', required: false })
  @Get()
  findAll(@Query('userId') userId?: string) {
    return this.tripService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripService.findOne(id);
  }

  // Route officielle attendue par la tâche : modification complète du voyage
  @Put(':id')
  update(@Param('id') id: string, @Body() updateVoyageDto: UpdateVoyageDto) {
    return this.tripService.update(id, updateVoyageDto);
  }

  // Route officielle attendue par la tâche : annulation (pas une vraie suppression)
  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.tripService.cancel(id);
  }
}