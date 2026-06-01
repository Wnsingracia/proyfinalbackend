import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { LogsModule } from './logs/logs.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { UsersModule } from './users/users.module';

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
    , AuthModule, DeliveriesModule, LogsModule, ProductsModule, SalesModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
