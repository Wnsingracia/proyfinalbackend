// src/ventas/ventas.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentasService } from './sales.service';
import { VentasController } from './sales.controller';
import { Venta } from './entities/sales.entity';
import { DetallesVentasModule } from '../detalle_venta/detalle_venta.module'; // Importante
import { Producto } from '../products/entities/products.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, Producto]),
    DetallesVentasModule // <-- Vinculamos el módulo secundario aquí
  ],
  controllers: [VentasController],
  providers: [VentasService]
})
export class VentasModule {}