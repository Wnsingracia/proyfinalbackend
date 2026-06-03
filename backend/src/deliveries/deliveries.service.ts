import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
import { Stock } from './entities/stock.entity';
import { Repository } from 'typeorm'
import { UpdateStockDto } from './dto/delivery.dto';


@Injectable()
export class DeliveriesService {
    constructor(
        @InjectRepository(Delivery) private readonly deliveryRepository: Repository<Delivery>,
        @InjectRepository(Stock) private readonly stockRepository: Repository<Stock>,
    ){}

    async obtStockPordelivery(idDelivery:number){
        return await this.stockRepository.find({
            where:{id_delivery:idDelivery},
            relations: {producto:true}
        })
    }

    async obtDeliverys(){
        return await this.deliveryRepository.find()
    }

    // src/deliveries/deliveries.service.ts

async actualizarStock(idDelivery: number, dto: UpdateStockDto) {
  const { id_producto, cantidad } = dto;

  // 1. Buscamos el registro de stock existente
  const stockExistente = await this.stockRepository.findOne({
    where: { id_delivery: idDelivery, id_producto }
  });

  if (stockExistente) {
    // REGLA: Si mandas un número positivo, SUMA. Si mandas un número negativo, RESTA.
    // Esto te sirve tanto para reabastecer (+50) como para registrar una venta (-2)
    stockExistente.cantidad += cantidad;

    // Validación de seguridad obligatoria para el negocio:
    if (stockExistente.cantidad < 0) {
      throw new BadRequestException('El stock resultante no puede ser menor a 0');
    }

    return await this.stockRepository.save(stockExistente);
  } else {
    // Si por algún motivo el producto no estaba en la sucursal, lo insertamos
    if (cantidad < 0) throw new BadRequestException('No puedes inicializar un stock en negativo');
    
    const nuevoStock = this.stockRepository.create({
      id_delivery: idDelivery,
      id_producto,
      cantidad,
    });
    return await this.stockRepository.save(nuevoStock);
  }
}

}
