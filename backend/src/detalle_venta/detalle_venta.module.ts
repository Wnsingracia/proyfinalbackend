import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetallesVentasService } from './detalle_venta.service';
import { DetallesVentasController } from './detalle_venta.controller';
import { DetalleVenta } from './entity/detalle_venta.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetalleVenta])
  ],
  controllers: [DetallesVentasController],
  providers: [DetallesVentasService],
  exports: [DetallesVentasService] // Importante exportarlo para que VentasService pueda usarlo
})
export class DetallesVentasModule {}