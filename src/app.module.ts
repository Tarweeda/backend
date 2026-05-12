import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ProductsModule } from './modules/products/products.module';
import { EventsModule } from './modules/events/events.module';
import { PackagesModule } from './modules/packages/packages.module';
import { HampersModule } from './modules/hampers/hampers.module';
import { HireModule } from './modules/hire/hire.module';
import { CateringModule } from './modules/catering/catering.module';
import { OrdersModule } from './modules/orders/orders.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { EmailModule } from './modules/email/email.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 60 },   // 60 req/min general
      { name: 'auth', ttl: 60000, limit: 10 },       // 10 req/min for login
    ]),
    EmailModule,
    ProductsModule,
    EventsModule,
    PackagesModule,
    HampersModule,
    HireModule,
    CateringModule,
    OrdersModule,
    BookingsModule,
    PaymentsModule,
    AdminModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
