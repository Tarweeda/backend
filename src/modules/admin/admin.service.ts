import { Injectable, UnauthorizedException } from '@nestjs/common';
import { getSupabase } from '../../config/supabase.config';

@Injectable()
export class AdminService {
  private get db() { return getSupabase(); }

  async login(email: string, password: string) {
    const { data, error } = await this.db.auth.signInWithPassword({ email, password });
    if (error) throw new UnauthorizedException('Invalid credentials');

    const user = data.user;
    if (user?.user_metadata?.role !== 'admin') throw new UnauthorizedException('Not an admin');

    return {
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: { id: user.id, email: user.email },
    };
  }

  async refresh(refreshToken: string) {
    const { data, error } = await this.db.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session) throw new UnauthorizedException('Session expired');

    const user = data.user;
    if (user?.user_metadata?.role !== 'admin') throw new UnauthorizedException('Not an admin');

    return {
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    };
  }

  async uploadImage(file: { buffer: Buffer; originalname: string; mimetype: string }) {
    const ext = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { data, error } = await this.db.storage
      .from('product-images')
      .upload(filename, file.buffer, { contentType: file.mimetype, upsert: false });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data: { publicUrl } } = this.db.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return { url: publicUrl };
  }
}
