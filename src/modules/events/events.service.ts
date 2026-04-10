import { Injectable, NotFoundException } from '@nestjs/common';
import { getSupabase } from '../../config/supabase.config';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  private get db() { return getSupabase(); }

  async findAllAdmin() {
    const { data, error } = await this.db
      .from('supper_events')
      .select('*')
      .order('event_date', { ascending: false });
    if (error) throw error;
    return data;
  }

  async create(dto: CreateEventDto) {
    if (dto.seats_left === undefined) dto.seats_left = dto.total_seats;
    const { data, error } = await this.db.from('supper_events').insert(dto).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, dto: UpdateEventDto) {
    const { data, error } = await this.db
      .from('supper_events')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async remove(id: string) {
    const { error } = await this.db
      .from('supper_events')
      .update({ status: 'cancelled' })
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  }

  async findAll() {
    const { data, error } = await this.db
      .from('supper_events')
      .select('*')
      .in('status', ['upcoming', 'sold_out'])
      .order('event_date');
    if (error) throw error;
    return data;
  }

  async findBySlug(slug: string) {
    const { data, error } = await this.db.from('supper_events').select('*').eq('slug', slug).single();
    if (error || !data) throw new NotFoundException('Event not found');
    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.db.from('supper_events').select('*').eq('id', id).single();
    if (error || !data) throw new NotFoundException('Event not found');
    return data;
  }

  async decrementSeats(eventId: string, count: number): Promise<boolean> {
    const { data, error } = await this.db.rpc('book_seats', { p_event_id: eventId, p_seats: count });
    if (error) throw error;
    return data === true;
  }
}
