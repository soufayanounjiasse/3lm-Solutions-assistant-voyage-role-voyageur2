import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssistantService } from './assistant.service';
import { AssistantController } from './assistant.controller';

@Module({
  imports: [ConfigModule],
  controllers: [AssistantController],
  providers: [AssistantService],
})
export class AssistantModule {}