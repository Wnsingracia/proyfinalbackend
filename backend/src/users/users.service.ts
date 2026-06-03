import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/user.entity';
import { CreateUserDto } from './dto/users.dto';
import { UpdateUserDto } from './dto/users.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  /**
   * CREAR USUARIO (Con encriptación de contraseña)
   */
  async crearUsuario(createUsuarioDto: CreateUserDto): Promise<Usuario> {
    const { nombre, email, password, rol } = createUsuarioDto;

    // Verificar si el correo ya está registrado (Evitar error duplicado de Postgres)
    const emailExiste = await this.usuarioRepository.findOne({ where: { email } });
    if (emailExiste) {
      throw new BadRequestException(`El correo ${email} ya está registrado en el sistema.`);
    }

    // Hashear la contraseña de forma asíncrona (10 rondas de salt)
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const nuevoUsuario = this.usuarioRepository.create({
      nombre,
      email,
      password_hash,
      rol
    });

    // Guardamos y retornamos el usuario
    const usuarioGuardado = await this.usuarioRepository.save(nuevoUsuario);
    
    // Opcional: Eliminar el hash de la respuesta por seguridad
    delete (usuarioGuardado as any).password_hash;
    return usuarioGuardado;
  }

  /**
   * OBTENER TODOS LOS USUARIOS (Activos)
   */
  async obtenerUsuarios(): Promise<Usuario[]> {
  return await this.usuarioRepository.find({
    // Corregido: Ahora es un objeto con valores true
    select: {
      id_usuario: true,
      nombre: true,
      email: true,
      rol: true,
      created_at: true,
      updated_at: true
    }
  });
}

  /**
   * BUSCAR UN USUARIO POR ID
   */
  async obtenerUsuarioPorId(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ 
      where: { id_usuario: id },
      select: {
      id_usuario: true,
      nombre: true,
      email: true,
      rol: true,
      created_at: true,
      updated_at: true
    }
    });
    
    if (!usuario) {
      throw new NotFoundException(`El usuario con ID ${id} no existe.`);
    }
    return usuario;
  }

  /**
   * BUSCAR POR EMAIL (Método crítico para tu futuro Auth/Login Service)
   */
  async obtenerPorEmail(email: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({ where: { email } });
  }

  /**
   * ACTUALIZAR USUARIO
   */
  async actualizarUsuario(id: number, updateUsuarioDto: UpdateUserDto): Promise<Usuario> {
    const usuario = await this.obtenerUsuarioPorId(id);

    // Si actualizan la contraseña, hay que volver a hashearla
    if (updateUsuarioDto.password) {
      const salt = await bcrypt.genSalt(10);
      (updateUsuarioDto as any).password_hash = await bcrypt.hash(updateUsuarioDto.password, salt);
      delete updateUsuarioDto.password; // Quitamos la propiedad en texto plano
    }

    // Mezclamos los cambios en la entidad
    this.usuarioRepository.merge(usuario, updateUsuarioDto);
    return await this.usuarioRepository.save(usuario);
  }

  /**
   * BORRADO LÓGICO (Soft Delete usando deleted_at)
   */
  async eliminarUsuario(id: number): Promise<{ mensaje: string }> {
    const usuario = await this.obtenerUsuarioPorId(id);
    await this.usuarioRepository.softDelete(usuario.id_usuario);
    return { mensaje: `Usuario '${usuario.nombre}' deshabilitado lógicamente con éxito.` };
  }
}