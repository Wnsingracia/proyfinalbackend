import { IsOptional, IsEmail, IsEnum, IsNotEmpty, IsString, Length } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  nombre: string = "";

  @IsNotEmpty({ message: 'El correo electrónico no puede estar vacío' })
  @IsEmail({}, { message: 'El correo electrónico debe ser una dirección válida' })
  email: string = "";

  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @Length(6, 255, { message: 'La contraseña debe tener por lo menos 6 caracteres' })
  password: string = "";

  @IsNotEmpty({ message: 'El rol no puede estar vacío' })
  @IsEnum(['ADMINISTRADOR', 'VENDEDOR'], { message: 'El rol debe ser ADMINISTRADOR o VENDEDOR' })
  rol: 'ADMINISTRADOR' | 'VENDEDOR' = 'VENDEDOR';
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico debe ser una dirección válida' })
  email?: string;

  @IsOptional()
  @IsString()
  @Length(6, 255, { message: 'La contraseña debe tener por lo menos 6 caracteres' })
  password?: string;

  @IsOptional()
  @IsEnum(['ADMINISTRADOR', 'VENDEDOR'], { message: 'El rol debe ser ADMINISTRADOR o VENDEDOR' })
  rol?: 'ADMINISTRADOR' | 'VENDEDOR';
}