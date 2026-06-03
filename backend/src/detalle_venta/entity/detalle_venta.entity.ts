import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Venta } from 'src/sales/entities/sales.entity';
// Importa tu entidad de Producto aquí (ejemplo ficticio de ruta)
import { Producto } from 'src/products/entities/products.entity';

@Entity('detalles_ventas')
export class DetalleVenta {
  @PrimaryGeneratedColumn()
  id_detalle: number = 0;

  @Column({ type: 'integer', nullable: false })
  id_venta: number = 0;

  @Column({ type: 'integer', nullable: false })
  id_producto: number = 0;

  @Column({ type: 'integer', nullable: false })
  cant_vendida: number = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  precio_subtotal: number = 0;

  // RELACIONES
  @ManyToOne(() => Venta, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_venta' })
  venta!: Venta;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'id_producto' })
  producto!: Producto;
}