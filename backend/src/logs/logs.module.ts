import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { LogAcceso } from './entities/logs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogAcceso])],
  controllers: [LogsController],
  providers: [LogsService]
})
export class LogsModule {}
