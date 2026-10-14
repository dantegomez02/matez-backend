import { SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { getSupabaseClient } from '../persistence/supabase/supabaseClient';
import { AppError } from '../domain/errors/AppErrors';

export class StorageService {
  private client: SupabaseClient;
  private bucket: string;

  constructor(client: SupabaseClient = getSupabaseClient(), bucket = env.SUPABASE_BUCKET) {
    this.client = client;
    this.bucket = bucket;
  }

  /**
   * Sube un buffer de imagen al bucket configurado en Supabase Storage
   * y retorna la URL pública accesible por el frontend.
   */
  async uploadProductImage(buffer: Buffer, originalname: string, mimetype: string): Promise<string> {
    const ext = (originalname.split('.').pop() || 'jpg').toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(fileName, buffer, {
        contentType: mimetype,
        upsert: false
      });

    if (error) {
      console.error('Error al subir imagen a Supabase Storage:', error);
      throw new AppError(`Error al subir la imagen: ${error.message}`, 500);
    }

    const { data: pubData } = this.client.storage
      .from(this.bucket)
      .getPublicUrl(fileName);

    if (!pubData?.publicUrl) {
      throw new AppError('No se pudo generar la URL pública de la imagen.', 500);
    }

    return pubData.publicUrl;
  }
}
