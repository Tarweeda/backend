import { Injectable } from '@nestjs/common';
import { getSupabase } from '../../config/supabase.config';

@Injectable()
export class HampersService {
  private get db() { return getSupabase(); }

  async findAll() {
    const { data, error } = await this.db.from('gift_hampers').select('*').eq('in_stock', true).order('sort_order');
    if (error) throw error;
    return data;
  }
}
