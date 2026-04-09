import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
})
export class AppModule {}
