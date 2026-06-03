import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { VentasService } from './sales.service'; // Corregido: 'sales.service' -> 'ventas.service'
import { CreateVentaDto } from './dto/sales.dto';// Corregido: alineado al nombre estándar del archivo DTO

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  async crear(@Body() createVentaDto: CreateVentaDto) { // Corregido: 'CreateSaleDto' -> 'CreateVentaDto'
    return await this.ventasService.crearVenta(createVentaDto);
  }

  @Get()
  async obtenerTodas() {
    return await this.ventasService.obtenerVentas();
  }

  @Get(':id')
  async obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return await this.ventasService.obtenerVentaPorId(id);
  }

  @Get('vendedor/:idVendedor')
  async obtenerPorVendedor(@Param('idVendedor', ParseIntPipe) idVendedor: number) {
    return await this.ventasService.obtenerVentasPorVendedor(idVendedor);
  }

  @Get('delivery/:idDelivery')
  async obtenerPorDelivery(@Param('idDelivery', ParseIntPipe) idDelivery: number) {
    return await this.ventasService.obtenerVentasPorDelivery(idDelivery);
  }

  @Delete(':id')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    return await this.ventasService.eliminarVenta(id);
  }
}