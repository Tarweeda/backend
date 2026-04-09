import { Injectable, NotFoundException } from '@nestjs/common';
import { getSupabase } from '../../config/supabase.config';

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

  async create(dto: any) {
    const { data, error } = await this.db
      .from('products')
      .insert(dto)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, dto: any) {
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
