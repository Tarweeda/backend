import { Injectable } from '@nestjs/common';
import { getSupabase } from '../../config/supabase.config';

@Injectable()
export class HireService {
  private get db() { return getSupabase(); }

  async findAllRoles() {
    const { data, error } = await this.db.from('hire_roles').select('*').order('sort_order');
    if (error) throw error;
    return data;
  }

  async createEnquiry(dto: any) {
    const refCode = `HIR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;
    const { data, error } = await this.db.from('hire_enquiries').insert({ ...dto, ref_code: refCode }).select().single();
    if (error) throw error;
    return data;
  }

  async findAllEnquiries() {
    const { data, error } = await this.db.from('hire_enquiries').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
}
