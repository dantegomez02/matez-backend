import { SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { getSupabaseClient } from '../persistence/supabase/supabaseClient';
import { UnauthorizedError } from '../domain/errors/AppErrors';

export interface AuthSession {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
}

export class AuthService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient = getSupabaseClient()) {
    this.client = client;
  }

  async login(password: string): Promise<AuthSession> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: env.ADMIN_EMAIL,
      password: password
    });

    if (error || !data.session) {
      throw new UnauthorizedError('Contraseña incorrecta.');
    }

    return {
      accessToken: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email || env.ADMIN_EMAIL
      }
    };
  }

  async verifyToken(token: string): Promise<boolean> {
    const { data, error } = await this.client.auth.getUser(token);
    return !error && !!data.user;
  }
}
