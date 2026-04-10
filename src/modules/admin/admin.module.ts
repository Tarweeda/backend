import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { OrdersModule } from '../orders/orders.module';
import { BookingsModule } from '../bookings/bookings.module';
import { ProductsModule } from '../products/products.module';
import { EventsModule } from '../events/events.module';
import { HampersModule } from '../hampers/hampers.module';
import { PackagesModule } from '../packages/packages.module';

@Module({
  imports: [OrdersModule, BookingsModule, ProductsModule, EventsModule, HampersModule, PackagesModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
