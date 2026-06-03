import { IsInt, Min, IsOptional, IsNotEmpty, IsString, Length } from "class-validator";

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

export class InsertarStockDto {
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsInt({ message: 'El ID del producto debe ser un número entero' })
  id_producto: number = 0;

  @IsNotEmpty({ message: 'La cantidad a ingresar es obligatoria' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad a insertar debe ser por lo menos 1' })
  cantidad: number = 0;
}

export class UpdateStockDto {
  @IsNotEmpty()
  @IsInt()
  id_producto: number = 0;

  @IsNotEmpty()
  @IsInt()
  @Min(0, { message: 'El stock no puede ser negativo' })
  cantidad: number = 0;
}