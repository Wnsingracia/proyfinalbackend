// src/ventas/ventas.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from './entities/sales.entity';
import { CreateVentaDto } from './dto/sales.dto';
import { DetallesVentasService } from 'src/detalle_venta/detalle_venta.service';
import { Producto } from 'src/products/entities/products.entity';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,

    // Inyectamos el servicio de detalles para guardar los ítems de forma automática
    private readonly detallesVentasService: DetallesVentasService,
  ) {}

  /**
   * CREAR VENTA Y SUS DETALLES
   * Recibe la cabecera y la lista de productos en una sola petición HTTP
   */
  async crearVenta(createVentaDto: CreateVentaDto): Promise<Venta> {
  const { id_delivery, id_vendedor, precio_total_venta, productos } = createVentaDto;

  // 1. Validación elemental
  if (!productos || productos.length === 0) {
    throw new BadRequestException('No se puede registrar una venta sin productos.');
  }

  // 2. Crear y guardar la cabecera inicializada en 0
  const nuevaVenta = this.ventaRepository.create({
    id_delivery,
    id_vendedor,
    precio_total_venta: 0 
  });
  const ventaGuardada = await this.ventaRepository.save(nuevaVenta);

  let totalAcumuladoVenta = 0;

  // 3. Recorrer el arreglo de productos e insertarlos en detalles_ventas
  for (const prod of productos) {
    const productoDB = await this.productoRepository.findOne({
      where: { id_producto: prod.id_producto }
    });
    
    if (!productoDB) {
      throw new NotFoundException(`El producto con ID ${prod.id_producto} no existe`);
    }

    // =============================================================================
    // ⚡ MATEMÁTICA FLEXIBLE: Prioriza el precio modificado en caliente del DTO
    // =============================================================================
    // Si desde React viene un subtotal (precio_base modificado * cantidad), usamos ese.
    // Si por algún motivo no viene, hacemos el cálculo tradicional con el precio de la BD.
    const subtotalFinal = prod.precio_subtotal && prod.precio_subtotal > 0
      ? Number(prod.precio_subtotal)
      : Number(productoDB.precio_base) * Number(prod.cant_vendida);

    // Para no romper tu DetallesVentasService, calculamos el precio unitario cobrado
    const precioUnitarioCobrado = subtotalFinal / Number(prod.cant_vendida);

    // Insertamos el detalle pasando el precio real transado en la calle
    const detalleInsertado = await this.detallesVentasService.crearDetalle(
      ventaGuardada.id_venta,
      prod,
      precioUnitarioCobrado // <── Inyectamos el precio unitario real modificado
    );
    
    // Acumulamos el subtotal exacto de este suplemento al total de la nota
    totalAcumuladoVenta += subtotalFinal;
  }

  // =============================================================================
  // 🏁 PASO 4: CONSOLIDACIÓN Y PERSISTENCIA FINANCIERA EN POSTGRES
  // =============================================================================
  // Asignamos la sumatoria real de los desgloses a la cabecera
  ventaGuardada.precio_total_venta = totalAcumuladoVenta;
  
  // Guardamos la cabecera final con el dinero real cobrado
  await this.ventaRepository.save(ventaGuardada);

  // Retornamos el objeto completo estructurado
  return (await this.ventaRepository.findOne({
    where: { id_venta: ventaGuardada.id_venta },
    relations: { productos: { producto: true } }
  }))!;
}

  /**
   * OBTENER TODAS LAS VENTAS ACTIVAS
   */
async obtenerVentas(): Promise<Venta[]> {
  return await this.ventaRepository.find({
    relations: {
      productos: {
        producto: true // Camina: Venta -> DetalleVenta -> Producto
      }
    },
    order: { fecha_venta: 'DESC' }
  });
}

  /**
   * BUSCAR UNA VENTA ESPECÍFICA POR SU ID
   */
  async obtenerVentaPorId(id: number): Promise<Venta> {
    const venta = await this.ventaRepository.findOne({ where: { id_venta: id } });
    if (!venta) {
      throw new NotFoundException(`La venta con ID ${id} no existe en el sistema.`);
    }
    return venta;
  }

  /**
   * HISTORIAL ESPECÍFICO DE UN VENDEDOR (Filtro para la Captura 3 de React)
   */
  async obtenerVentasPorVendedor(idVendedor: number): Promise<Venta[]> {
    return await this.ventaRepository.find({
      where: { id_vendedor: idVendedor },
      order: { fecha_venta: 'DESC' }
    });
  }

  /**
   * HISTORIAL GLOBAL DE UN DELIVERY / REPARTIDOR (Filtro para la Captura 4 de React)
   */
  async obtenerVentasPorDelivery(idDelivery: number): Promise<Venta[]> {
    return await this.ventaRepository.find({
      where: { id_delivery: idDelivery },
      order: { fecha_venta: 'DESC' }
    });
  }

  /**
   * ELIMINACIÓN LÓGICA (Soft Delete)
   * Usa el campo deleted_at de forma automática gracias al decorador de TypeORM
   */
  async eliminarVenta(id: number): Promise<{ mensaje: string }> {
    const venta = await this.obtenerVentaPorId(id);
    await this.ventaRepository.softDelete(venta.id_venta);
    return { mensaje: `La venta con ID ${id} fue eliminada lógicamente con éxito.` };
  }
}