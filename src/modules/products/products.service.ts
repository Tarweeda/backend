import { Injectable, NotFoundException } from '@nestjs/common';
import { getSupabase } from '../../config/supabase.config';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  private get db() {
    return getSupabase();
  }

  async findAll(category?: string) {
    let query = this.db
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .order('sort_order');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async findAllAdmin() {
    const { data, error } = await this.db
      .from('products')
      .select('*')
      .order('sort_order');
    if (error) throw error;
    return data;
  }

  async findBySlug(slug: string) {
    const { data, error } = await this.db
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) throw new NotFoundException('Product not found');
    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.db
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Product not found');
    return data;
  }

  async create(dto: CreateProductDto) {
    const { initial_quantity, ...productFields } = dto;
    const quantity = initial_quantity ?? 0;

    const { data, error } = await this.db
      .from('products')
      .insert({ ...productFields, quantity, in_stock: quantity > 0 })
      .select()
      .single();
    if (error) throw error;

    if (quantity > 0) {
      await this.db.from('stock_movements').insert({
        product_id: data.id,
        type: 'IN',
        quantity,
        reason: 'Initial stock on product creation',
      });
    }

    return data;
  }

  async update(id: string, dto: UpdateProductDto) {
    const { data, error } = await this.db
      .from('products')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const { error } = await this.db
      .from('products')
      .update({ in_stock: false })
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  }
}
