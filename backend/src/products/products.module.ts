import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto])],
  controllers: [ProductsController],
  providers: [ProductsService]
})
export class ProductsModule {}
