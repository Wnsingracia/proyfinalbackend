import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateLogDto {
  @IsOptional()
  @IsInt()
  id_usuario?: number;

  @IsOptional()
  @IsString()
  username_intento?: string;

  @IsNotEmpty()
  @IsString()
  ip: string = "";

  @IsNotEmpty()
  @IsEnum(['INGRESO', 'SALIDA', 'LOGIN_FALLIDO'])
  evento: 'INGRESO' | 'SALIDA' | 'LOGIN_FALLIDO' = 'INGRESO';

  @IsNotEmpty()
  @IsString()
  browser: string = "";
}