import { Controller, Post, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegistroDto } from './dto/auth.dto'; // Tu archivo unificado de DTOs
import type { Request } from 'express';

@Controller('auth') // Ruta base para autenticación: /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/registro
   * Registra un nuevo usuario en el sistema evaluando la fuerza de su contraseña
   * y validando el CAPTCHA enviado desde React.
   */
  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  async registro(
    @Body() registroDto: RegistroDto, 
    @Req() req: Request
  ) {
    // Captura de datos de red e infraestructura para la bitácora
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const browser = req.headers['user-agent'] || 'Desconocido';
    
    return await this.authService.registro(registroDto, ip, browser);
  }

  /**
   * POST /auth/login
   * Autentica a un usuario, valida el CAPTCHA y registra el evento 
   * (INGRESO o LOGIN_FALLIDO) en la base de datos.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto, 
    @Req() req: Request
  ) {
    // Captura de datos de red e infraestructura para la bitácora
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const browser = req.headers['user-agent'] || 'Desconocido';

    return await this.authService.login(loginDto, ip, browser);
  }
}