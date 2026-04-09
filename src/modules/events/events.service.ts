import { Injectable, NotFoundException } from '@nestjs/common';
import { getSupabase } from '../../config/supabase.config';

@Injectable()
export class EventsService {
  private get db() { return getSupabase(); }

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
