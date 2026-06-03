import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './users.service';
import { UsuariosController } from './users.controller';
import { Usuario } from './entities/user.entity';

@Module({
  imports: [
    // Registramos la entidad para que NestJS genere el repositorio dinámico
    TypeOrmModule.forFeature([Usuario])
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService] // Lo exportamos por si necesitas validar usuarios en otros módulos (como Ventas o Login)
})
export class UsuariosModule {}