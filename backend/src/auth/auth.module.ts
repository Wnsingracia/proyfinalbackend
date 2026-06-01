// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt'; // <-- 1. Importar el módulo
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Usuario } from '../users/entities/user.entity';
import { LogAcceso } from 'src/logs/entities/logs.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, LogAcceso]),
    
    // 2. Registrar el JWT con tus configuraciones
    JwtModule.register({
      global: true, // Lo hace disponible en otros módulos sin re-importar
      secret: process.env.JWT_SECRET || 'CLAVE_SECRETA_SUPER_SEGURA_DE_MI_GRUPO', // Usa env en producción
      signOptions: { expiresIn: '8h' }, // Tiempo de expiración del token
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}