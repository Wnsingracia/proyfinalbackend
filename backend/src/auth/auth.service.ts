import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../users/entities/user.entity';
import { LogAcceso } from 'src/logs/entities/logs.entity';
import { Delivery } from '../deliveries/entities/delivery.entity'; // <-- Añadido
import { Stock } from '../deliveries/entities/stock.entity';       // <-- Añadido
import { Producto } from 'src/products/entities/products.entity';   // <-- Añadido
import { LoginDto, RegistroDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(LogAcceso) private readonly logRepo: Repository<LogAcceso>,
    
    // Inyección de los repositorios necesarios para automatizar la derivación por rol
    @InjectRepository(Delivery) private readonly deliveryRepo: Repository<Delivery>,
    @InjectRepository(Stock) private readonly stockRepo: Repository<Stock>,
    @InjectRepository(Producto) private readonly productoRepo: Repository<Producto>,
    
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
   * Crea un nuevo usuario y automatiza la inserción espejo de sucursal y stock si es DELIVERY
   */
  async registro(registroDto: RegistroDto, ip: string, browser: string) {
    // 1. Verificación del captchaToken con la petición de React
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

    // 5. Construir y guardar entidad del Usuario Base
    const nuevoUsuario = this.usuarioRepo.create({
      nombre: registroDto.nombre,
      email: registroDto.email,
      password_hash: hash,
      rol: registroDto.rol,
    });
    
    const usuarioGuardado = await this.usuarioRepo.save(nuevoUsuario);

    // =============================================================================
    // FLUJO AUTOMATIZADO DE DERIVACIÓN POR ROL: 'DELIVERY'
    // =============================================================================
    if (registroDto.rol === 'DELIVERY') {
      // Validamos que el JSON de React traiga los datos obligatorios para armar la sucursal
      if (!registroDto.nombre_sucursal) {
        throw new BadRequestException('Para el rol DELIVERY, el nombre de la sucursal es obligatorio');
      }

      // A) Insertar fila espejo en la tabla 'deliveries' clonando el id_usuario generado
      const nuevoDelivery = this.deliveryRepo.create({
        id_delivery: usuarioGuardado.id_usuario, // Relación Identificativa (PK y FK compartidas)
        nombre_sucursal: registroDto.nombre_sucursal,
        direccion: registroDto.direccion || '',
      });
      await this.deliveryRepo.save(nuevoDelivery);

      // B) Cargar de forma masiva todos los productos para inicializar sus stocks en cero
      const todosLosProductos = await this.productoRepo.find({ select: {id_producto: true} });
      
      if (todosLosProductos.length > 0) {
        const stocksIniciales = todosLosProductos.map((prod) => {
          return this.stockRepo.create({
            id_delivery: usuarioGuardado.id_usuario,
            id_producto: prod.id_producto,
            cantidad: 0, // Se inicializan listos en cero
          });
        });
        
        // Inserción en lote (Bulk Insert) para ahorrar recursos de red
        await this.stockRepo.save(stocksIniciales);
      }
    }

    return { 
      mensaje: 'Usuario registrado con éxito', 
      fuerzaPassword: nivel,
      id_usuario: usuarioGuardado.id_usuario,
      configuracionExtra: registroDto.rol === 'DELIVERY' ? 'Sucursal e inventario inicializado' : 'Ninguna'
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