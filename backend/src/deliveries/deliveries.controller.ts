// src/deliveries/deliveries.controller.ts
import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { UpdateStockDto } from './dto/delivery.dto';

@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  /**
   * GET /deliveries
   * Obtiene la lista de todos los delivieries/sucursales registradas
   */
  @Get()
  async obtenerDeliveries() {
    return await this.deliveriesService.obtDeliverys();
  }

  /**
   * GET /deliveries/:id/stock
   * Obtiene el stock disponible de una sucursal específica junto con los datos del producto
   */
  @Get(':id/stock')
  async obtenerStockPorDelivery(@Param('id', ParseIntPipe) id: number) {
    return await this.deliveriesService.obtStockPordelivery(id);
  }

  /**
   * PATCH /deliveries/:id/stock
   * Modifica el stock (suma o resta) de un producto en un delivery específico
   */
  @Patch(':id/stock')
  async actualizarStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStockDto: UpdateStockDto,
  ) {
    return await this.deliveriesService.actualizarStock(id, updateStockDto);
  }
}