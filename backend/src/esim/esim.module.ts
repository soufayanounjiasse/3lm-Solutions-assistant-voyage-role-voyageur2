import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EsimController } from './esim.controller';
import { EsimService } from './esim.service';
import { EsimOrder } from './entities/esim-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EsimOrder])],
  controllers: [EsimController],
  providers: [EsimService],
})
export class EsimModule {}
