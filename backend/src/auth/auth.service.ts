import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../users/entities/user.entity';
import { LogAcceso } from 'src/logs/entities/logs.entity';
import { LoginDto, RegistroDto } from './dto/auth.dto'; // Asegúrate de que esta ruta sea la de tu archivo unificado
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(LogAcceso) private readonly logRepo: Repository<LogAcceso>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Evalúa la robustez de la contraseña (Requerimiento del proyecto)
   */
  private evaluarFuerzaPassword(password: string): 'DEBIL' | 'INTERMEDIO' | 'FUERTE' {
    const tieneLetras = /[a-zA-Z]/.test(password);
    const tieneNumeros = /[0-9]/.test(password);
    const tieneEspeciales = /[^a-zA-Z0-9]/.test(password);

    if (password.length >= 10 && tieneLetras && tieneNumeros && tieneEspeciales) return 'FUERTE';
    if (password.length >= 8 && tieneLetras && tieneNumeros) return 'INTERMEDIO';
    return 'DEBIL';
  }

  /**
   * MÉTODO: registro
   * Crea un nuevo usuario validando CAPTCHA y encriptando su password
   */
  async registro(registroDto: RegistroDto, ip: string, browser: string) {
    // 1. Aquí irá tu lógica de verificación del captchaToken con la API externa si es necesario
    if (!registroDto.captchaToken) {
      throw new BadRequestException('El token del CAPTCHA es inválido o expiró');
    }

    // 2. Comprobar disponibilidad del correo electrónico
    const existe = await this.usuarioRepo.findOne({ where: { email: registroDto.email } });
    if (existe) {
      throw new BadRequestException('El correo electrónico ya se encuentra registrado');
    }

    // 3. Validar fuerza de la contraseña (Requerimiento obligatorio)
    const nivel = this.evaluarFuerzaPassword(registroDto.password);
    if (nivel === 'DEBIL') {
      throw new BadRequestException('La contraseña es demasiado débil. Debe contener al menos letras y números.');
    }

    // 4. Encriptar contraseña (Guardado seguro)
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(registroDto.password, salt);

    // 5. Construir y guardar entidad
    const nuevoUsuario = this.usuarioRepo.create({
      nombre: registroDto.nombre,
      email: registroDto.email,
      password_hash: hash,
      rol: registroDto.rol,
    });
    
    await this.usuarioRepo.save(nuevoUsuario);

    return { 
      mensaje: 'Usuario registrado con éxito', 
      fuerzaPassword: nivel 
    };
  }

  /**
   * MÉTODO: login
   * Autentica credenciales, escribe bitácora y genera el token JWT
   */
  async login(loginDto: LoginDto, ip: string, browser: string) {
    const usuario = await this.usuarioRepo.findOne({ where: { email: loginDto.email } });

    // Si falla la autenticación, registramos el evento adverso en logs_acceso
    if (!usuario || !(await bcrypt.compare(loginDto.password, usuario.password_hash))) {
      await this.logRepo.save({
        username_intento: loginDto.email,
        ip,
        evento: 'LOGIN_FALLIDO',
        browser,
      });
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Si es exitoso, registramos el ingreso del usuario en la bitácora
    await this.logRepo.save({
      id_usuario: usuario.id_usuario,
      ip,
      evento: 'INGRESO',
      browser,
    });

    // Generar la firma del token JWT con el payload de sesión
    const payload = { sub: usuario.id_usuario, email: usuario.email, rol: usuario.rol };
    const token = this.jwtService.sign(payload);

    return {
      usuario: { 
        id_usuario: usuario.id_usuario, 
        nombre: usuario.nombre, 
        rol: usuario.rol 
      },
      token,
    };
  }
}