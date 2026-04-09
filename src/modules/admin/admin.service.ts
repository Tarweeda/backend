import { Injectable, UnauthorizedException } from '@nestjs/common';
import { getSupabase } from '../../config/supabase.config';

@Injectable()
export class AdminService {
  private get db() { return getSupabase(); }

  async login(email: string, password: string) {
    const { data, error } = await this.db.auth.signInWithPassword({ email, password });
    if (error) throw new UnauthorizedException('Invalid credentials');

    const user = data.user;
    const role = user?.user_metadata?.role;
    if (role !== 'admin') throw new UnauthorizedException('Not an admin');

    return { token: data.session.access_token, user: { id: user.id, email: user.email } };
  }
}
