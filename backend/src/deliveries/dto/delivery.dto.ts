import { IsOptional, IsNotEmpty, IsString, Length } from "class-validator";

export class CreateDeliveryDto {
  @IsNotEmpty({ message: 'El nombre de la sucursal no puede estar vacío' })
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  nombre_sucursal: string = "";

  @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
  direccion: string = "";
}

export class UpdateDeliveryDto {
  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'El nombre de la sucursal debe tener entre 2 y 100 caracteres' })
  nombre_sucursal?: string;

  @IsOptional()
  @IsString()
  direccion?: string;
}