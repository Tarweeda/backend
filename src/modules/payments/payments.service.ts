import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-04-30.basil' as any,
    });
  }

  async createPaymentIntent(amountPence: number, metadata: Record<string, string>) {
    return this.stripe.paymentIntents.create({
      amount: amountPence,
      currency: 'gbp',
      metadata,
      automatic_payment_methods: { enabled: true },
    });
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  }
}
