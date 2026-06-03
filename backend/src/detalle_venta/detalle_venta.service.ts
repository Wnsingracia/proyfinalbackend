import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetalleVenta } from './entity/detalle_venta.entity';
import { CreateDetalleVentaDto } from './dto/detall_venta.dto';

@Injectable()
export class DetallesVentasService {
  constructor(
    @InjectRepository(DetalleVenta)
    private readonly detalleRepository: Repository<DetalleVenta>,
  ) {}

  /**
   * Insertar un detalle amarrado a una venta específica calculando el subtotal real
   */
  async crearDetalle(idVenta: number, dto: CreateDetalleVentaDto, precioBaseProducto: number): Promise<DetalleVenta> {
    
    // MATEMÁTICA ESTRICTA: Multiplicamos la cantidad que manda el cliente por el precio real de la BD
    const subtotalCalculado = precioBaseProducto * dto.cant_vendida;

    const nuevoDetalle = this.detalleRepository.create({
      id_venta: idVenta,
      id_producto: dto.id_producto,
      cant_vendida: dto.cant_vendida,
      precio_subtotal: subtotalCalculado // <--- Reemplazamos lo que mande el frontend por el valor real calculado en el servidor
    });

    return await this.detalleRepository.save(nuevoDetalle);
  }

  /**
   * Obtener los productos y cantidades de una venta específica (Útil para el acordeón de React)
   */
  async obtenerDetallesPorVenta(idVenta: number): Promise<DetalleVenta[]> {
    return await this.detalleRepository.find({
      where: { id_venta: idVenta },
      relations: { producto: true } // Trae nombre, precio_base, etc., del suplemento
    });
  }
}