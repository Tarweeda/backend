import { Injectable, BadRequestException } from '@nestjs/common';
import { getSupabase } from '../../config/supabase.config';
import { ProductsService } from '../products/products.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  private get db() { return getSupabase(); }

  async create(dto: CreateOrderDto) {
    // 1. Validate products and calculate server-side total
    const orderItems = [];
    let subtotalPence = 0;

    for (const item of dto.items) {
      const product = await this.productsService.findById(item.product_id);
      if (!product.in_stock) {
        throw new BadRequestException(`${product.name} is out of stock`);
      }
      const lineTotalPence = product.price_pence * item.quantity;
      subtotalPence += lineTotalPence;
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        unit_price_pence: product.price_pence,
        quantity: item.quantity,
        line_total_pence: lineTotalPence,
      });
    }

    const deliveryFeePence = dto.fulfilment_type === 'delivery' ? 500 : 0;
    const totalPence = subtotalPence + deliveryFeePence;

    // 2. Generate order number
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = String(Math.floor(Math.random() * 999)).padStart(3, '0');
    const orderNumber = `TRW-${date}-${rand}`;

    // 3. Create order in DB
    const { data: order, error: orderError } = await this.db
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: dto.customer_name,
        customer_email: dto.customer_email,
        fulfilment_type: dto.fulfilment_type,
        delivery_address: dto.delivery_address || null,
        notes: dto.notes || null,
        subtotal_pence: subtotalPence,
        delivery_fee_pence: deliveryFeePence,
        total_pence: totalPence,
        payment_status: 'pending',
        order_status: 'received',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 4. Insert order items
    const itemsWithOrder = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));
    const { error: itemsError } = await this.db.from('order_items').insert(itemsWithOrder);
    if (itemsError) throw itemsError;

    // 5. Create Stripe PaymentIntent
    const paymentIntent = await this.paymentsService.createPaymentIntent(totalPence, {
      type: 'order',
      id: order.id,
      order_number: orderNumber,
    });

    // 6. Update order with PI ID
    await this.db.from('orders').update({
      stripe_payment_intent_id: paymentIntent.id,
    }).eq('id', order.id);

    return {
      order_id: order.id,
      order_number: orderNumber,
      client_secret: paymentIntent.client_secret,
      total_pence: totalPence,
    };
  }

  async findById(id: string) {
    const { data, error } = await this.db
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async findAll(status?: string) {
    let query = this.db.from('orders').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('order_status', status);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async updateStatus(id: string, orderStatus: string) {
    const { data, error } = await this.db
      .from('orders')
      .update({ order_status: orderStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
