import { Controller, Post, Req, Res, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { getSupabase } from '../../config/supabase.config';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    let event;
    try {
      // Use rawBody (Buffer) for correct Stripe signature verification
      event = this.paymentsService.constructWebhookEvent(
        req.rawBody!,
        signature,
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err}`);
    }

    const db = getSupabase();

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      const { type, id } = pi.metadata;

      if (type === 'order') {
        await db.from('orders').update({
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        }).eq('id', id);
      } else if (type === 'booking') {
        await db.from('supper_bookings').update({
          payment_status: 'paid',
          updated_at: new Date().toISOString(),
        }).eq('id', id);
      }
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object;
      const { type, id } = pi.metadata;

      if (type === 'order') {
        await db.from('orders').update({
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        }).eq('id', id);
      } else if (type === 'booking') {
        await db.from('supper_bookings').update({
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        }).eq('id', id);
      }
    }

    return res.status(200).json({ received: true });
  }
}
