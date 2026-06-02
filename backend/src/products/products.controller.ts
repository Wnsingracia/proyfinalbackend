import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Delete } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/products.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productosService: ProductsService) {}

    @Get()
    obtTodo() {
        return this.productosService.obtTodo();
    }

    // CORRECCIÓN: Se añade ParseIntPipe para transformar el string de la URL a number
    @Get(':id')
    obtProd(@Param('id', ParseIntPipe) id: number) {
        return this.productosService.obtProducto(id);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    inserta(@Body() productodto: CreateProductDto) {
        return this.productosService.inserta(productodto);
    }

    @Patch(':id')
    actualiza(@Param('id', ParseIntPipe) id: number, @Body() productoDTO: UpdateProductDto) {
        return this.productosService.actualiza(id, productoDTO);
    }

    // CORRECCIÓN: Se añade ParseIntPipe y se pasan los paréntesis (id) para ejecutar el método
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    elimina(@Param('id', ParseIntPipe) id: number) {
        return this.productosService.elimina(id);
    }
}