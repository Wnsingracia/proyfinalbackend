import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DetallesVentasService } from './detalle_venta.service';

@Controller('detalles-ventas')
export class DetallesVentasController {
  constructor(private readonly detallesVentasService: DetallesVentasService) {}

  /**
   * GET /detalles-ventas/venta/:idVenta
   * Retorna los suplementos comprados en una transacción
   */
  @Get('venta/:idVenta')
  async obtenerPorVenta(@Param('idVenta', ParseIntPipe) idVenta: number) {
    return await this.detallesVentasService.obtenerDetallesPorVenta(idVenta);
  }
}