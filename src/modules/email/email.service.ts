import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend | null = null;

  private getClient() {
    if (!this.resend) {
      const key = process.env.RESEND_API_KEY;
      if (!key) return null;
      this.resend = new Resend(key);
    }
    return this.resend;
  }

  async sendOrderConfirmation(order: any) {
    const client = this.getClient();
    if (!client) { console.log('[Email] No Resend key — skipping order confirmation'); return; }

    await client.emails.send({
      from: 'Tarweeda <orders@tarweeda.com>',
      to: order.customer_email,
      subject: `Order Confirmed — ${order.order_number}`,
      html: `
        <h2>Thank you for your order, ${order.customer_name}!</h2>
        <p>Your order <strong>${order.order_number}</strong> has been received.</p>
        <p>Total: <strong>£${(order.total_pence / 100).toFixed(2)}</strong></p>
        <p>Fulfilment: ${order.fulfilment_type === 'delivery' ? 'Delivery' : 'Collection'}</p>
        <p>We'll be in touch to confirm details.</p>
        <br><p>— Tarweeda</p>
      `,
    });
  }

  async sendBookingConfirmation(booking: any, eventName: string) {
    const client = this.getClient();
    if (!client) { console.log('[Email] No Resend key — skipping booking confirmation'); return; }

    await client.emails.send({
      from: 'Tarweeda <bookings@tarweeda.com>',
      to: booking.email,
      subject: `Booking Confirmed — ${booking.booking_ref}`,
      html: `
        <h2>You're on the table, ${booking.first_name}!</h2>
        <p>Your reservation for <strong>${eventName}</strong> is confirmed.</p>
        <p>Reference: <strong>${booking.booking_ref}</strong></p>
        <p>Total: <strong>£${(booking.total_pence / 100).toFixed(2)}</strong></p>
        <p>Check your email closer to the event for final details.</p>
        <br><p>— Tarweeda</p>
      `,
    });
  }

  async notifyAdmin(subject: string, body: string) {
    const client = this.getClient();
    if (!client) { console.log(`[Email] No Resend key — skipping admin notification: ${subject}`); return; }

    const adminEmail = process.env.ADMIN_EMAIL || 'hello@tarweeda.com';
    await client.emails.send({
      from: 'Tarweeda System <system@tarweeda.com>',
      to: adminEmail,
      subject,
      html: body,
    });
  }

  async sendEnquiryNotification(type: 'catering' | 'hire', enquiry: any) {
    const subject = type === 'catering'
      ? `New Catering Enquiry — ${enquiry.ref_code}`
      : `New Hire Enquiry — ${enquiry.ref_code}`;

    const body = `
      <h2>New ${type} enquiry received</h2>
      <p><strong>Ref:</strong> ${enquiry.ref_code}</p>
      <p><strong>Name:</strong> ${enquiry.name}</p>
      <p><strong>Email:</strong> ${enquiry.email}</p>
      ${enquiry.event_type ? `<p><strong>Event:</strong> ${enquiry.event_type}</p>` : ''}
      ${enquiry.guest_count ? `<p><strong>Guests:</strong> ${enquiry.guest_count}</p>` : ''}
      <p>View in admin dashboard to respond.</p>
    `;

    await this.notifyAdmin(subject, body);
  }
}
