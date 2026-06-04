import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Delivery } from './delivery.entity';
import { Producto } from '../../products/entities/products.entity';

@Entity('stocks')
export class Stock {
  // Como es una tabla intermedia con llave primaria compuesta, declaramos ambas como PrimaryColumn
  @PrimaryColumn({ type: 'integer' })
  id_delivery: number = 0;

  @PrimaryColumn({ type: 'integer' })
  id_producto: number = 0;

  @Column({ type: 'integer', default: 0 })
  cantidad: number = 0;

  // =============================================================================
  // RELACIONES (Muchos stocks pertenecen a un Delivery y a un Producto)
  // =============================================================================

  @ManyToOne(() => Delivery, (delivery) => delivery.id_delivery, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_delivery' })
  delivery!: Delivery;

  @ManyToOne(() => Producto, (producto) => producto.id_producto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_producto' })
  producto!: Producto;
}