import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PaymentsModule } from '../payments/payments.module';
import { EventsModule } from '../events/events.module';
import { PackagesModule } from '../packages/packages.module';

@Module({
  imports: [PaymentsModule, EventsModule, PackagesModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
