import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id_usuario: number = 0;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nombre: string = '';

  @Column({ type: 'varchar', length: 150, unique: true, nullable: false })
  email: string = '';

  @Column({ type: 'varchar', length: 255, nullable: false })
  password_hash: string = '';

  @Column({ type: 'varchar', length: 50, default: 'VENDEDOR', nullable: false })
  rol: string = 'VENDEDOR';

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at!: Date;

  // TypeORM maneja la eliminación lógica automáticamente con este decorador
  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deleted_at?: Date;
}