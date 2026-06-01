import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn()
  id_delivery: number = 0;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nombre_sucursal: string = '';

  @Column({ type: 'text', nullable: true })
  direccion: string = '';

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deleted_at?: Date;
}