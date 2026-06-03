import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateDetalleVentaDto {
  @IsNotEmpty()
  @IsInt()
  id_producto: number = 0;

  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'La cantidad vendida debe ser al menos 1' })
  cant_vendida: number = 0;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio_subtotal: number = 0;
}