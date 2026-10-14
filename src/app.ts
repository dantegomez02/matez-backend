import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/errorHandler';

export function createApp() {
  const app = express();

  // Ocultar información de fingerprint del servidor
  app.disable('x-powered-by');

  // Cabeceras de seguridad HTTP básicas
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // Middlewares globales con límite de payload para prevenir DoS
  app.use(cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
    credentials: true
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Servir frontend estático si existe en producción / local
  const frontendPath = path.resolve(__dirname, '../../frontend');
  app.use(express.static(frontendPath));

  // Rutas de API
  app.use('/api', apiRoutes);

  // Fallback 404 para API
  app.use('/api/*', (_req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint de API no encontrado.'
    });
  });

  // Manejador centralizado de errores
  app.use(errorHandler);

  return app;
}
