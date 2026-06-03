import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id_producto: number = 0;

  @Column({ type: 'varchar', length: 150, nullable: false })
  nombre_prod: string = '';

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  precio_base: number = 0;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deleted_at?: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
url_imagen: string | null = null;
}