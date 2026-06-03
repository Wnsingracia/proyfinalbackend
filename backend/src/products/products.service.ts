import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto/products.dto';
import { Producto } from './entities/products.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'

@Injectable()
export class ProductsService {
    constructor(@InjectRepository(Producto) private repositorio: Repository<Producto>){}

    async obtTodo(){
        return await this.repositorio.find()
    }

    async obtProducto(id: number){
        const producto = await this.repositorio.findOne({where: {id_producto: id}});
        if (!producto){
            throw new NotFoundException ('Producto no encontrado')
        }
        return producto
    }

    async inserta(productoDTO: CreateProductDto){
        const producto=this.repositorio.create(productoDTO);
        return await this.repositorio.save(producto)
    }

    async actualiza(id: number, productoDTO: UpdateProductDto){
        const producto = await this.obtProducto(id);
        Object.assign(producto, productoDTO);
        return await this.repositorio.save(producto)
    }
    async elimina(id: number){
        const resultado = await this.repositorio.delete(id);
        if(resultado.affected===0){
            throw new NotFoundException('Producto no encontrado');
        }
    }
}
