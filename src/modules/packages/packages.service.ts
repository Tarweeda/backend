import { Injectable, NotFoundException } from '@nestjs/common';
import { getSupabase } from '../../config/supabase.config';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackagesService {
  private get db() { return getSupabase(); }

  async findAll() {
    const { data, error } = await this.db.from('supper_packages').select('*').order('sort_order');
    if (error) throw error;
    return data;
  }

  async findByEventId(eventId: string) {
    const { data, error } = await this.db
      .from('supper_packages')
      .select('*')
      .eq('event_id', eventId)
      .order('sort_order');
    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.db.from('supper_packages').select('*').eq('id', id).single();
    if (error || !data) throw new NotFoundException('Package not found');
    return data;
  }

  async create(dto: CreatePackageDto) {
    const { data, error } = await this.db.from('supper_packages').insert(dto).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, dto: UpdatePackageDto) {
    const { data, error } = await this.db
      .from('supper_packages')
      .update(dto)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const { error } = await this.db.from('supper_packages').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  }
}
