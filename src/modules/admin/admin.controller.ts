import { Controller, Post, Get, Patch, Delete, Param, Body, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { OrdersService } from '../orders/orders.service';
import { BookingsService } from '../bookings/bookings.service';
import { ProductsService } from '../products/products.service';
import { EventsService } from '../events/events.service';
import { HampersService } from '../hampers/hampers.service';
import { PackagesService } from '../packages/packages.service';
import { getSupabase } from '../../config/supabase.config';
import { AdminGuard } from '../../common/guards/admin.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { CreateEventDto } from '../events/dto/create-event.dto';
import { UpdateEventDto } from '../events/dto/update-event.dto';
import { CreateHamperDto } from '../hampers/dto/create-hamper.dto';
import { UpdateHamperDto } from '../hampers/dto/update-hamper.dto';
import { CreatePackageDto } from '../packages/dto/create-package.dto';
import { UpdatePackageDto } from '../packages/dto/update-package.dto';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly ordersService: OrdersService,
    private readonly bookingsService: BookingsService,
    private readonly productsService: ProductsService,
    private readonly eventsService: EventsService,
    private readonly hampersService: HampersService,
    private readonly packagesService: PackagesService,
  ) {}

  @Public()
  @Throttle({ auth: { ttl: 60000, limit: 5 } })  // 5 attempts per minute
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.adminService.login(body.email, body.password);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() body: { refresh_token: string }) {
    return this.adminService.refresh(body.refresh_token);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 },  // 5 MB max
    fileFilter: (_req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPEG, PNG, WebP and GIF images are allowed'), false);
      }
    },
  }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('No valid file uploaded');
    return this.adminService.uploadImage(file);
  }

  // Products
  @Get('products')
  getProducts() {
    return this.productsService.findAllAdmin();
  }

  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  // Events
  @Get('events')
  getEvents() {
    return this.eventsService.findAllAdmin();
  }

  @Post('events')
  createEvent(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Patch('events/:id')
  updateEvent(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Delete('events/:id')
  deleteEvent(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }

  // Packages
  @Get('packages')
  getPackages(@Query('event_id') eventId?: string) {
    if (eventId) return this.packagesService.findByEventId(eventId);
    return this.packagesService.findAll();
  }

  @Post('packages')
  createPackage(@Body() dto: CreatePackageDto) {
    return this.packagesService.create(dto);
  }

  @Patch('packages/:id')
  updatePackage(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    return this.packagesService.update(id, dto);
  }

  @Delete('packages/:id')
  deletePackage(@Param('id') id: string) {
    return this.packagesService.remove(id);
  }

  // Orders
  @Get('orders')
  getOrders(@Query('status') status?: string) {
    return this.ordersService.findAll(status);
  }

  @Get('orders/:id')
  getOrder(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: { order_status: string }) {
    const valid = ['received', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled'];
    if (!valid.includes(body.order_status)) throw new BadRequestException('Invalid order status');
    return this.ordersService.updateStatus(id, body.order_status);
  }

  @Delete('orders/:id')
  cancelOrder(@Param('id') id: string) {
    return this.ordersService.updateStatus(id, 'cancelled');
  }

  // Bookings
  @Get('bookings')
  getBookings() {
    return this.bookingsService.findAll();
  }

  @Patch('bookings/:id/status')
  updateBookingStatus(@Param('id') id: string, @Body() body: { booking_status: string }) {
    const valid = ['confirmed', 'cancelled', 'waitlisted', 'attended', 'no_show'];
    if (!valid.includes(body.booking_status)) throw new BadRequestException('Invalid booking status');
    return this.bookingsService.updateStatus(id, body.booking_status);
  }

  // Hampers
  @Get('hampers')
  getHampers() {
    return this.hampersService.findAllAdmin();
  }

  @Post('hampers')
  createHamper(@Body() dto: CreateHamperDto) {
    return this.hampersService.create(dto);
  }

  @Patch('hampers/:id')
  updateHamper(@Param('id') id: string, @Body() dto: UpdateHamperDto) {
    return this.hampersService.update(id, dto);
  }

  @Delete('hampers/:id')
  deleteHamper(@Param('id') id: string) {
    return this.hampersService.remove(id);
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
    const valid = ['new', 'in_review', 'quoted', 'confirmed', 'declined'];
    if (!valid.includes(body.status)) throw new BadRequestException('Invalid enquiry status');
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
    const valid = ['new', 'in_review', 'quoted', 'confirmed', 'declined'];
    if (!valid.includes(body.status)) throw new BadRequestException('Invalid enquiry status');
    const { data, error } = await getSupabase().from('hire_enquiries').update({ status: body.status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
}
