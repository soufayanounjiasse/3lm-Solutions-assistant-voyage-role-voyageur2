import {
  Controller, Get, Post, Put, Body, Param, Delete, Query,
} from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { TripService } from './trip.service';
import { CreateVoyageDto } from './dto/create-voyage.dto';
import { UpdateVoyageDto } from './dto/update-voyage.dto';
import { VoyageStatut } from './entities/voyage.entity';

@ApiTags('voyages')
@Controller('voyages')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  create(@Body() createVoyageDto: CreateVoyageDto) {
    return this.tripService.create(createVoyageDto);
  }

  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'statut', required: false, enum: VoyageStatut })
  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('statut') statut?: VoyageStatut,
  ) {
    return this.tripService.findAll(userId, statut);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateVoyageDto: UpdateVoyageDto) {
    return this.tripService.update(id, updateVoyageDto);
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.tripService.cancel(id);
  }
}