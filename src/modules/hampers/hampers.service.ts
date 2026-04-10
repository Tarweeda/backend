import { Injectable, NotFoundException } from '@nestjs/common';
import { getSupabase } from '../../config/supabase.config';
import { CreateHamperDto } from './dto/create-hamper.dto';
import { UpdateHamperDto } from './dto/update-hamper.dto';

@Injectable()
export class HampersService {
  private get db() { return getSupabase(); }

  async findAll() {
    const { data, error } = await this.db.from('gift_hampers').select('*').eq('in_stock', true).order('sort_order');
    if (error) throw error;
    return data;
  }

  async findAllAdmin() {
    const { data, error } = await this.db.from('gift_hampers').select('*').order('sort_order');
    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.db.from('gift_hampers').select('*').eq('id', id).single();
    if (error || !data) throw new NotFoundException('Hamper not found');
    return data;
  }

  async create(dto: CreateHamperDto) {
    const { data, error } = await this.db.from('gift_hampers').insert(dto).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, dto: UpdateHamperDto) {
    const { data, error } = await this.db
      .from('gift_hampers')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const { error } = await this.db.from('gift_hampers').update({ in_stock: false }).eq('id', id);
    if (error) throw error;
    return { success: true };
  }
}
