import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { LogsModule } from './logs/logs.module';
import { ProductsModule } from './products/products.module';
import { VentasModule } from './sales/sales.module';
import { UsuariosModule } from './users/users.module';
import { DetallesVentasModule } from './detalle_venta/detalle_venta.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from 'process';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    TypeOrmModule.forRootAsync({
      imports:[ConfigModule],
      useFactory: async (ConfigService: ConfigService) =>({
        type: 'postgres',
        host: ConfigService.get('DB_HOST'),
        port: ConfigService.get<number>('DB_PORT'),
        username: ConfigService.get('DB_USERNAME'),
        password: ConfigService.get('DB_PASSWORD'),
        database: ConfigService.get('DB_DATABASE'),
        autoLoadEntities:true,
        synchronize:true
      }),
      inject: [ConfigService]
    })
    , AuthModule, DeliveriesModule, LogsModule, ProductsModule, VentasModule, UsuariosModule, DetallesVentasModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
