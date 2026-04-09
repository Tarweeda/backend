import { Injectable, NotFoundException } from '@nestjs/common';
import { getSupabase } from '../../config/supabase.config';

@Injectable()
export class PackagesService {
  private get db() { return getSupabase(); }

  async findAll() {
    const { data, error } = await this.db.from('supper_packages').select('*').order('sort_order');
    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.db.from('supper_packages').select('*').eq('id', id).single();
    if (error || !data) throw new NotFoundException('Package not found');
    return data;
  }
}
