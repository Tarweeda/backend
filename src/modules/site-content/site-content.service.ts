import { Injectable } from '@nestjs/common';
import { getSupabase } from '../../config/supabase.config';

type SiteContentMap = Record<string, Record<string, unknown>>;

@Injectable()
export class SiteContentService {
  private get db() {
    return getSupabase();
  }

  // PostgREST code when a table is missing — treat as "no content yet" so the
  // public site falls back to code defaults instead of erroring.
  private isMissingTable(error: { code?: string } | null): boolean {
    return error?.code === 'PGRST205';
  }

  async findAll(): Promise<SiteContentMap> {
    const { data, error } = await this.db.from('site_content').select('key, value');
    if (error) {
      if (this.isMissingTable(error)) return {};
      throw error;
    }
    const map: SiteContentMap = {};
    for (const row of data ?? []) {
      map[row.key] = row.value ?? {};
    }
    return map;
  }

  async findOne(key: string): Promise<Record<string, unknown>> {
    const { data, error } = await this.db
      .from('site_content')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (error) {
      if (this.isMissingTable(error)) return {};
      throw error;
    }
    return (data?.value as Record<string, unknown>) ?? {};
  }

  async upsert(key: string, value: Record<string, unknown>) {
    const { data, error } = await this.db
      .from('site_content')
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: 'key' },
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
