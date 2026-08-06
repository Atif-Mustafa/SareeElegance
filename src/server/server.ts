import { env } from './config/env';
import { app } from './app';

const server = app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`🚀 Saree Elegance API running on port ${env.PORT} (${env.NODE_ENV})`);
});

function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}. Shutting down HTTP server gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
