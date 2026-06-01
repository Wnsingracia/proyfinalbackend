import { IsOptional, IsNotEmpty, IsNumber, IsString, Length, Min } from "class-validator";

export class CreateProductDto {
  @IsNotEmpty({ message: 'El nombre del producto no puede estar vacío' })
  @Length(2, 150, { message: 'El valor debe ser de por lo menos 2 caracteres' })
  nombre_prod: string = "";

  @IsNotEmpty({ message: 'El precio base no puede estar vacío' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio base debe ser un número válido' })
  @Min(0, { message: 'El precio base no puede ser negativo' })
  precio_base: number = 0;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Length(2, 150, { message: 'El nombre del producto debe tener entre 2 y 150 caracteres' })
  nombre_prod?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio base debe ser un número válido' })
  @Min(0, { message: 'El precio base no puede ser negativo' })
  precio_base?: number;
}