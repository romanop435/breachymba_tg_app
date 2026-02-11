import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import sensible from '@fastify/sensible';
import rateLimit from '@fastify/rate-limit';
import redis from '@fastify/redis';
import { env } from './lib/env.js';
import authPlugin from './plugins/auth.js';
import feedRoutes from './routes/feed.js';
import workshopRoutes from './routes/workshop.js';
import collectionRoutes from './routes/collections.js';
import serverRoutes from './routes/servers.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import { startSchedulers } from './jobs/scheduler.js';

export function buildApp() {
  const app = Fastify({
    logger: {
      transport: process.env.NODE_ENV === 'production'
        ? undefined
        : {
            target: 'pino-pretty',
            options: { translateTime: 'SYS:standard' }
          }
    }
  });

  app.register(cors, {
    origin: env.corsOrigin,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  });
  app.register(jwt, { secret: env.jwtSecret });
  app.register(sensible);
  app.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute'
  });

  if (env.redisUrl) {
    app.register(redis, { url: env.redisUrl });
  }

  app.register(authPlugin);

  app.get('/health', async () => ({ ok: true }));

  app.register(authRoutes);
  app.register(feedRoutes);
  app.register(workshopRoutes);
  app.register(collectionRoutes);
  app.register(serverRoutes);
  app.register(adminRoutes);

  app.addHook('onReady', async () => {
    startSchedulers();
  });

  return app;
}
