import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('logs_acceso')
export class LogAcceso {
  @PrimaryGeneratedColumn()
  id_log: number = 0;

  @Column({ type: 'integer', nullable: true })
  id_usuario?: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  username_intento?: string;

  @Column({ type: 'varchar', length: 45, nullable: false })
  ip: string = '';

  @Column({ type: 'varchar', length: 50, nullable: false })
  evento: string = ''; // 'INGRESO', 'SALIDA', 'LOGIN_FALLIDO'

  @Column({ type: 'text', nullable: false })
  browser: string = '';

  @CreateDateColumn({ type: 'timestamp with time zone' })
  fecha_hora!: Date;
}