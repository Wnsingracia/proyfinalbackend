import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../users/entities/user.entity';
import { LogAcceso } from 'src/logs/entities/logs.entity';
import { Delivery } from '../deliveries/entities/delivery.entity'; 
import { Stock } from '../deliveries/entities/stock.entity';      
import { Producto } from 'src/products/entities/products.entity';   
import { LoginDto, RegistroDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(LogAcceso) private readonly logRepo: Repository<LogAcceso>,
    
    // Inyección de los repositorios para automatizar la derivación por rol
    @InjectRepository(Delivery) private readonly deliveryRepo: Repository<Delivery>,
    @InjectRepository(Stock) private readonly stockRepo: Repository<Stock>,
    @InjectRepository(Producto) private readonly productoRepo: Repository<Producto>,
    
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Evalúa la robustez de la contraseña (Requerimiento del proyecto)
   */
  private evaluarFuerzaPassword(password: string): 'DEBIL' | 'INTERMEDIO' | 'FUERTE' {
    const pass = password || '';
    const tieneLetras = /[a-zA-Z]/.test(pass);
    const tieneNumeros = /[0-9]/.test(pass);
    const tieneEspeciales = /[^a-zA-Z0-9]/.test(pass);

    if (pass.length >= 10 && tieneLetras && tieneNumeros && tieneEspeciales) return 'FUERTE';
    if (pass.length >= 8 && tieneLetras && tieneNumeros) return 'INTERMEDIO';
    return 'DEBIL';
  }

  /**
   * MÉTODO: registro
   * Crea un nuevo usuario y automatiza la inserción espejo de sucursal y stocks en cero
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

    // 4. Encriptar contraseña de forma segura (Bcrypt Hashing)
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
    // FLUJO AUTOMATIZADO EXCLUSIVO PARA EL ROL: 'DELIVERY'
    // =============================================================================
    // =============================================================================
    // FLUJO AUTOMATIZADO EXCLUSIVO PARA EL ROL: 'DELIVERY' (Blindado contra FK)
    // =============================================================================
    if (registroDto.rol === 'DELIVERY') {
      if (!registroDto.nombre_sucursal) {
        throw new BadRequestException('Para el rol DELIVERY, el nombre de la sucursal es obligatorio');
      }

      // 1. Creamos la instancia del Delivery usando la instancia de usuario recién guardada
      // En lugar de pasar el ID numérico plano, pasamos el objeto entero 'usuarioGuardado'
      // para que TypeORM entienda la relación de herencia de llaves.
      const nuevoDelivery = this.deliveryRepo.create({
        id_delivery: usuarioGuardado.id_usuario,
        nombre_sucursal: registroDto.nombre_sucursal,
        direccion: registroDto.direccion || '',
      });

      // 2. Persistimos el delivery de forma tradicional esperándolo con await
      const deliveryGuardado = await this.deliveryRepo.save(nuevoDelivery);

      // 3. Cargamos los productos existentes del catálogo
      const todosLosProductos = await this.productoRepo.find({ select: { id_producto: true } });
      
      if (todosLosProductos.length > 0) {
        // 4. Creamos las entidades de stock mapeadas de forma explícita
        const stocksIniciales = todosLosProductos.map((prod) => {
          return this.stockRepo.create({
            id_delivery: deliveryGuardado.id_delivery, // Usamos la propiedad confirmada de la sucursal guardada
            id_producto: prod.id_producto,
            cantidad: 0,
          });
        });
        
        // 5. Salvamos los stocks utilizando el Repositorio Nativo
        // Al usar .save() con instancias creadas mediante .create(), TypeORM sabe
        // que debe sincronizar la transacción con Postgres antes de evaluar las FKs.
        await this.stockRepo.save(stocksIniciales);
      }
    }

    // Retorno limpio del método en su lugar correcto (Fuera del bloque If)
    return { 
      mensaje: 'Usuario registrado con éxito', 
      fuerzaPassword: nivel,
      id_usuario: usuarioGuardado.id_usuario,
      configuracionExtra: registroDto.rol === 'DELIVERY' ? 'Sucursal e inventario inicializado en cero' : 'Ninguna'
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