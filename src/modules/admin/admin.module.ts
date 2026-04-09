import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { OrdersModule } from '../orders/orders.module';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [OrdersModule, BookingsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
