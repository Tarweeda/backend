import { Injectable, NotFoundException } from '@nestjs/common';
import { getSupabase } from '../../config/supabase.config';
import { RestockDto } from './dto/restock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class InventoryService {
  private get db() {
    return getSupabase();
  }

  // ── KPI Summary ──────────────────────────────────────────────────────────────

  async getSummary() {
    const { data: products, error } = await this.db
      .from('products')
      .select('quantity, low_stock_threshold, cost_price_pence, price_pence, in_stock');
    if (error) throw error;

    const total = products.length;
    const outOfStock = products.filter((p) => p.quantity === 0).length;
    const lowStock = products.filter(
      (p) => p.quantity > 0 && p.quantity <= p.low_stock_threshold,
    ).length;
    const totalStockValue = products.reduce(
      (sum, p) => sum + (p.cost_price_pence ?? p.price_pence) * p.quantity,
      0,
    );

    // Movements over last 30 days grouped by day
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: movements } = await this.db
      .from('stock_movements')
      .select('type, quantity, created_at')
      .gte('created_at', since)
      .order('created_at');

    const chartMap: Record<string, { date: string; in: number; out: number }> = {};
    for (const m of movements ?? []) {
      const date = m.created_at.slice(0, 10);
      if (!chartMap[date]) chartMap[date] = { date, in: 0, out: 0 };
      if (m.type === 'IN') chartMap[date].in += m.quantity;
      if (m.type === 'OUT') chartMap[date].out += m.quantity;
    }
    const chart = Object.values(chartMap).sort((a, b) => a.date.localeCompare(b.date));

    // Top 5 products by OUT volume
    const { data: topMovements } = await this.db
      .from('stock_movements')
      .select('product_id, quantity, products(name)')
      .eq('type', 'OUT')
      .gte('created_at', since);

    const soldMap: Record<string, { name: string; sold: number }> = {};
    for (const m of topMovements ?? []) {
      const pid = m.product_id;
      if (!soldMap[pid]) soldMap[pid] = { name: (m as any).products?.name ?? pid, sold: 0 };
      soldMap[pid].sold += m.quantity;
    }
    const topSold = Object.values(soldMap)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    // Alert products
    const alerts = products
      .filter((p) => p.quantity <= p.low_stock_threshold)
      .map((p) => p);

    return { total, outOfStock, lowStock, totalStockValue, chart, topSold, alerts };
  }

  // ── Products with stock info ──────────────────────────────────────────────

  async getProductsWithStock(status?: string) {
    const { data: products, error } = await this.db
      .from('products')
      .select('id, name, sku, category, quantity, low_stock_threshold, in_stock, price_pence, cost_price_pence, updated_at')
      .order('name');
    if (error) throw error;

    // Sold quantity from OUT movements
    const { data: sold } = await this.db
      .from('stock_movements')
      .select('product_id, quantity')
      .eq('type', 'OUT');

    const soldMap: Record<string, number> = {};
    for (const m of sold ?? []) {
      soldMap[m.product_id] = (soldMap[m.product_id] ?? 0) + m.quantity;
    }

    let result = products.map((p) => ({
      ...p,
      sold_qty: soldMap[p.id] ?? 0,
      stock_status:
        p.quantity === 0
          ? 'out-of-stock'
          : p.quantity <= p.low_stock_threshold
          ? 'low-stock'
          : 'in-stock',
    }));

    if (status === 'low') result = result.filter((p) => p.stock_status === 'low-stock');
    if (status === 'oos') result = result.filter((p) => p.stock_status === 'out-of-stock');

    return result;
  }

  // ── Movement history ──────────────────────────────────────────────────────

  async getMovements(opts: {
    product_id?: string;
    type?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) {
    const { product_id, type, from, to, page = 1, limit = 50 } = opts;
    const offset = (page - 1) * limit;

    let query = this.db
      .from('stock_movements')
      .select('*, products(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (product_id) query = query.eq('product_id', product_id);
    if (type) query = query.eq('type', type);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, total: count ?? 0, page, limit };
  }

  // ── Restock ───────────────────────────────────────────────────────────────

  async restock(dto: RestockDto) {
    const { data: product, error: fetchErr } = await this.db
      .from('products')
      .select('id, quantity')
      .eq('id', dto.product_id)
      .single();
    if (fetchErr || !product) throw new NotFoundException('Product not found');

    const newQty = product.quantity + dto.quantity;

    await this.db
      .from('products')
      .update({ quantity: newQty, in_stock: true, updated_at: new Date().toISOString() })
      .eq('id', dto.product_id);

    const { data: movement, error: movErr } = await this.db
      .from('stock_movements')
      .insert({
        product_id: dto.product_id,
        type: 'IN',
        quantity: dto.quantity,
        reason: dto.note ?? 'Manual restock',
        created_by: dto.created_by,
      })
      .select()
      .single();
    if (movErr) throw movErr;

    return { new_quantity: newQty, movement };
  }

  // ── Adjust ────────────────────────────────────────────────────────────────

  async adjust(dto: AdjustStockDto) {
    const { data: product, error: fetchErr } = await this.db
      .from('products')
      .select('id, quantity')
      .eq('id', dto.product_id)
      .single();
    if (fetchErr || !product) throw new NotFoundException('Product not found');

    const delta = dto.direction === 'subtract' ? -dto.quantity : dto.quantity;
    const newQty = Math.max(0, product.quantity + delta);

    const updates: Record<string, unknown> = {
      quantity: newQty,
      updated_at: new Date().toISOString(),
    };
    if (newQty === 0) updates.in_stock = false;
    if (newQty > 0 && !product.quantity) updates.in_stock = true;

    await this.db.from('products').update(updates).eq('id', dto.product_id);

    const { data: movement, error: movErr } = await this.db
      .from('stock_movements')
      .insert({
        product_id: dto.product_id,
        type: 'ADJUSTMENT',
        quantity: dto.quantity,
        reason: dto.reason,
        created_by: dto.created_by,
      })
      .select()
      .single();
    if (movErr) throw movErr;

    return { new_quantity: newQty, movement };
  }

  // ── Reports ───────────────────────────────────────────────────────────────

  async getReports(type: string, from?: string, to?: string) {
    switch (type) {
      case 'stock-in':
        return this.getMovementReport('IN', from, to);
      case 'stock-out':
        return this.getMovementReport('OUT', from, to);
      case 'snapshot':
        return this.getSnapshotReport();
      case 'low-stock':
        return this.getLowStockReport();
      default:
        return this.getMovementReport('IN', from, to);
    }
  }

  private async getMovementReport(moveType: string, from?: string, to?: string) {
    let query = this.db
      .from('stock_movements')
      .select('*, products(name, sku, category)')
      .eq('type', moveType)
      .order('created_at', { ascending: false });

    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  private async getSnapshotReport() {
    const { data, error } = await this.db
      .from('products')
      .select('id, name, sku, category, quantity, low_stock_threshold, cost_price_pence, price_pence, in_stock')
      .order('name');
    if (error) throw error;
    return data;
  }

  private async getLowStockReport() {
    const { data, error } = await this.db
      .from('products')
      .select('id, name, sku, category, quantity, low_stock_threshold, in_stock')
      .order('quantity');
    if (error) throw error;
    return data.filter((p) => p.quantity <= p.low_stock_threshold);
  }

  // ── CSV Export ────────────────────────────────────────────────────────────

  async exportCsv(type: string, from?: string, to?: string): Promise<string> {
    const data = await this.getReports(type, from, to) as any[];

    if (!data.length) return 'No data available for the selected range.\n';

    const keys = Object.keys(data[0]).filter(
      (k) => k !== 'products' && typeof data[0][k] !== 'object',
    );

    const header = keys.join(',');
    const rows = data.map((row) =>
      keys.map((k) => {
        const val = row[k];
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(','),
    );

    return [header, ...rows].join('\n');
  }
}
