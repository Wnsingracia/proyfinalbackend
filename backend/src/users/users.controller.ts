import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { UsuariosService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  async crear(@Body() createUsuarioDto: CreateUserDto) {
    return await this.usuariosService.crearUsuario(createUsuarioDto);
  }

  @Get()
  async obtenerTodos() {
    return await this.usuariosService.obtenerUsuarios();
  }

  @Get(':id')
  async obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return await this.usuariosService.obtenerUsuarioPorId(id);
  }

  @Patch(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUserDto,
  ) {
    return await this.usuariosService.actualizarUsuario(id, updateUsuarioDto);
  }

  @Delete(':id')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    return await this.usuariosService.eliminarUsuario(id);
  }
}