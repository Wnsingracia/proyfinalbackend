import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { DetalleVenta } from 'src/detalle_venta/entity/detalle_venta.entity';

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn()
  id_venta: number = 0;

  @Column({ type: 'integer', nullable: false })
  id_delivery: number = 0;

  @Column({ type: 'integer', nullable: false })
  id_vendedor: number = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  precio_total_venta: number = 0;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  fecha_venta!: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deleted_at?: Date;

  @OneToMany(() => DetalleVenta, (detalle) => detalle.venta, { cascade: true })
  productos!: DetalleVenta[];
}