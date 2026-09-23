import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ProductsModule } from './products/products.module.js';
import { BranchesModule } from './branches/branches.module.js';
import { CartModule } from './cart/cart.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { DeliverySlotsModule } from './delivery-slots/delivery-slots.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'sampath-food-city',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'sampath_food_city',
      autoLoadEntities: true,
      // Auto-sync is convenient for dev/demo but should be OFF in real prod
      // (use migrations instead). Controlled via env so RDS in prod is safe.
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      ssl:
        process.env.DB_SSL === 'true'
          ? { rejectUnauthorized: false }
          : false,
    }),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    BranchesModule,
    CartModule,
    OrdersModule,
    DeliverySlotsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
