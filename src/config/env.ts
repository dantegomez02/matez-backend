import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://iohflzqelwhheicprnik.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_BUCKET: process.env.SUPABASE_BUCKET || 'productos-imagenes',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'gomezdante88@gmail.com',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};

if (!env.SUPABASE_ANON_KEY) {
  console.warn('⚠️ ADVERTENCIA: SUPABASE_ANON_KEY no está definida en las variables de entorno.');
}
