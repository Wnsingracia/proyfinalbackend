import { IsNumber, IsArray, IsInt, IsNotEmpty, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateDetalleVentaDto } from "../../detalle_venta/dto/detall_venta.dto";

export class SaleDetailDto {
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsInt({ message: 'El ID del producto debe ser un entero' })
  id_producto: number = 0;

  @IsNotEmpty({ message: 'La cantidad vendida es obligatoria' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad vendida debe ser al menos 1' })
  cant_vendida: number = 0;
}

export class CreateVentaDto {
  @IsNotEmpty()
  @IsInt()
  id_delivery: number = 0;

  @IsNotEmpty()
  @IsInt()
  id_vendedor: number = 0;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio_total_venta: number = 0;

  // AGREGAMOS EL ARRAY DE PRODUCTOS COMPRADOS
  @IsArray()
  @ValidateNested({ each: true }) // <-- Solo necesitas 'each: true' para que valide cada objeto del arreglo
  @Type(() => CreateDetalleVentaDto)
  productos!: CreateDetalleVentaDto[];
}