import 'dotenv/config';
import { env } from './config/env';
import { app } from './app';
import { PrismaService } from './infrastructure/database/prisma';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import express from 'express';

async function startServer() {
  const PORT = 3000;

  // Add Vite middleware or static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Saree Elegance API running on port ${PORT} (${env.NODE_ENV})`);
  });

  async function gracefulShutdown(signal: string) {
    console.log(`Received ${signal}. Shutting down HTTP server gracefully...`);
    server.close(async () => {
      console.log('HTTP server closed.');
      try {
        await PrismaService.disconnect();
        console.log('Database connection closed.');
      } catch (err) {
        console.error('Error during database disconnection:', err);
      }
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000).unref();
  }

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

startServer();
