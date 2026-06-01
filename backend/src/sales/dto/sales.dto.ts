import { IsArray, IsInt, IsNotEmpty, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class SaleDetailDto {
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsInt({ message: 'El ID del producto debe ser un entero' })
  id_producto: number = 0;

  @IsNotEmpty({ message: 'La cantidad vendida es obligatoria' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad vendida debe ser al menos 1' })
  cant_vendida: number = 0;
}

export class CreateSaleDto {
  @IsNotEmpty({ message: 'El ID de la sucursal (delivery) es obligatorio' })
  @IsInt({ message: 'El ID de la sucursal debe ser un entero' })
  id_delivery: number = 0;

  @IsNotEmpty({ message: 'El ID del vendedor es obligatorio' })
  @IsInt({ message: 'El ID del vendedor debe ser un entero' })
  id_vendedor: number = 0;

  @IsArray({ message: 'Los detalles de la venta deben ser una lista' })
  @ValidateNested({ each: true })
  @Type(() => SaleDetailDto)
  detalles: SaleDetailDto[] = [];
}