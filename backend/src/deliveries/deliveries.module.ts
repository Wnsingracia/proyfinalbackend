// src/deliveries/deliveries.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveriesService } from './deliveries.service';
import { DeliveriesController } from './deliveries.controller';
import { Delivery } from './entities/delivery.entity';
import { Stock } from './entities/stock.entity'; 
import { Producto } from '../products/entities/products.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delivery, Stock, Producto]) 
  ],
  controllers: [DeliveriesController],
  providers: [DeliveriesService],
})
export class DeliveriesModule {}