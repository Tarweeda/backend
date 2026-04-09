import { Injectable } from '@nestjs/common';
import { getSupabase } from '../../config/supabase.config';

@Injectable()
export class CateringService {
  private get db() { return getSupabase(); }

  async createEnquiry(dto: any) {
    const refCode = `CAT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;
    const { data, error } = await this.db.from('catering_enquiries').insert({ ...dto, ref_code: refCode }).select().single();
    if (error) throw error;
    return data;
  }

  async findAllEnquiries() {
    const { data, error } = await this.db.from('catering_enquiries').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
}
