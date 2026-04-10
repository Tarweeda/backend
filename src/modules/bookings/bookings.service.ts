import { Injectable, BadRequestException } from '@nestjs/common';
import { getSupabase } from '../../config/supabase.config';
import { EventsService } from '../events/events.service';
import { PackagesService } from '../packages/packages.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly eventsService: EventsService,
    private readonly packagesService: PackagesService,
    private readonly paymentsService: PaymentsService,
  ) {}

  private get db() { return getSupabase(); }

  async create(dto: CreateBookingDto) {
    const event = await this.eventsService.findById(dto.event_id);
    const pkg = await this.packagesService.findById(dto.package_id);

    if (event.status !== 'upcoming') {
      throw new BadRequestException('Event is no longer available');
    }

    // Generate booking ref
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = String(Math.floor(Math.random() * 999)).padStart(3, '0');
    const bookingRef = `SCB-${date}-${rand}`;

    // Handle enquiry packages (no payment)
    if (pkg.is_enquiry) {
      const { data, error } = await this.db.from('supper_bookings').insert({
        booking_ref: bookingRef,
        event_id: dto.event_id,
        package_id: dto.package_id,
        first_name: dto.first_name,
        last_name: dto.last_name,
        email: dto.email,
        phone: dto.phone || null,
        dietary: dto.dietary,
        special_requests: dto.special_requests || null,
        total_pence: 0,
        payment_status: 'pending',
        booking_status: 'confirmed',
      }).select().single();
      if (error) throw error;
      return { booking_id: data.id, booking_ref: bookingRef, client_secret: null, total_pence: 0, is_enquiry: true };
    }

    // Book seats (with row locking)
    const seatsBooked = await this.eventsService.decrementSeats(dto.event_id, pkg.guests);
    if (!seatsBooked) {
      throw new BadRequestException('Not enough seats available');
    }

    // Create booking
    const { data: booking, error: bookingError } = await this.db.from('supper_bookings').insert({
      booking_ref: bookingRef,
      event_id: dto.event_id,
      package_id: dto.package_id,
      first_name: dto.first_name,
      last_name: dto.last_name,
      email: dto.email,
      phone: dto.phone || null,
      dietary: dto.dietary,
      special_requests: dto.special_requests || null,
      total_pence: pkg.price_pence,
      payment_status: 'pending',
      booking_status: 'confirmed',
    }).select().single();
    if (bookingError) throw bookingError;

    // Create Stripe PaymentIntent
    const pi = await this.paymentsService.createPaymentIntent(pkg.price_pence, {
      type: 'booking',
      id: booking.id,
      booking_ref: bookingRef,
    });

    await this.db.from('supper_bookings').update({
      stripe_payment_intent_id: pi.id,
    }).eq('id', booking.id);

    return {
      booking_id: booking.id,
      booking_ref: bookingRef,
      client_secret: pi.client_secret,
      total_pence: pkg.price_pence,
      is_enquiry: false,
    };
  }

  async findById(id: string) {
    const { data, error } = await this.db.from('supper_bookings').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async findAll() {
    const { data, error } = await this.db.from('supper_bookings').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async updateStatus(id: string, bookingStatus: string) {
    const { data, error } = await this.db
      .from('supper_bookings')
      .update({ booking_status: bookingStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
