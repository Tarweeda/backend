import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { InventoryService } from './inventory.service';
import { RestockDto } from './dto/restock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { AdminGuard } from '../../common/guards/admin.guard';

@Controller('admin/inventory')
@UseGuards(AdminGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('summary')
  getSummary() {
    return this.inventoryService.getSummary();
  }

  @Get('products')
  getProducts(@Query('status') status?: string) {
    return this.inventoryService.getProductsWithStock(status);
  }

  @Get('movements')
  getMovements(
    @Query('product_id') product_id?: string,
    @Query('type') type?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventoryService.getMovements({
      product_id,
      type,
      from,
      to,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Post('restock')
  restock(@Body() dto: RestockDto) {
    return this.inventoryService.restock(dto);
  }

  @Post('adjust')
  adjust(@Body() dto: AdjustStockDto) {
    return this.inventoryService.adjust(dto);
  }

  @Get('reports')
  getReports(
    @Query('type') type: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.inventoryService.getReports(type ?? 'snapshot', from, to);
  }

  @Get('reports/export')
  async exportCsv(
    @Query('type') type: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const csv = await this.inventoryService.exportCsv(type ?? 'snapshot', from, to);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="inventory-${type}-${Date.now()}.csv"`);
    res.send(csv);
  }
}
