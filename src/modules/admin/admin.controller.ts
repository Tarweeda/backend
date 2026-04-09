import { Controller, Post, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { OrdersService } from '../orders/orders.service';
import { BookingsService } from '../bookings/bookings.service';
import { getSupabase } from '../../config/supabase.config';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly ordersService: OrdersService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.adminService.login(body.email, body.password);
  }

  // Orders
  @Get('orders')
  getOrders(@Query('status') status?: string) {
    return this.ordersService.findAll(status);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: { order_status: string }) {
    return this.ordersService.updateStatus(id, body.order_status);
  }

  // Bookings
  @Get('bookings')
  getBookings() {
    return this.bookingsService.findAll();
  }

  // Catering enquiries
  @Get('catering/enquiries')
  async getCateringEnquiries() {
    const { data, error } = await getSupabase().from('catering_enquiries').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  @Patch('catering/enquiries/:id')
  async updateCateringStatus(@Param('id') id: string, @Body() body: { status: string }) {
    const { data, error } = await getSupabase().from('catering_enquiries').update({ status: body.status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  // Hire enquiries
  @Get('hire/enquiries')
  async getHireEnquiries() {
    const { data, error } = await getSupabase().from('hire_enquiries').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  @Patch('hire/enquiries/:id')
  async updateHireStatus(@Param('id') id: string, @Body() body: { status: string }) {
    const { data, error } = await getSupabase().from('hire_enquiries').update({ status: body.status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
}
