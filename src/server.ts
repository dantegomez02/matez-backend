import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`🚀 Servidor Matez Junín corriendo en: http://localhost:${env.PORT}`);
  console.log(`📦 Modo: ${env.NODE_ENV}`);
  console.log(`🔗 API Base: http://localhost:${env.PORT}/api`);
  console.log(`🩺 Health Check: http://localhost:${env.PORT}/api/health`);
});
