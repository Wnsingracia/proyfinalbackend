import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { LogsModule } from './logs/logs.module';
import { ProductsModule } from './products/products.module';
import { VentasModule } from './sales/sales.module';
import { UsuariosModule } from './users/users.module';
import { DetallesVentasModule } from './detalle_venta/detalle_venta.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      database: 'ryztor',
      username: 'postgres',
      password: '123456',
      entities: [__dirname + '/**/*.entity{.ts,.js}']
    })
    , AuthModule, DeliveriesModule, LogsModule, ProductsModule, VentasModule, UsuariosModule, DetallesVentasModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
