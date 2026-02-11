import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../lib/env.js';

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    try {
      await request.jwtVerify();
    } catch (err) {
      if (env.authDebug) {
        return reply.code(401).send({
          error: 'Unauthorized',
          reason: authHeader ? 'invalid_token' : 'missing_authorization',
          message: err instanceof Error ? err.message : String(err || '')
        });
      }
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  fastify.decorate('requireAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    try {
      await request.jwtVerify();
      const telegramId = (request.user as any)?.telegramId as string | undefined;
      const isAdmin = telegramId && env.adminTelegramIds.includes(telegramId);
      if (!isAdmin) {
        return reply.code(403).send({ error: 'Forbidden' });
      }
    } catch (err) {
      if (env.authDebug) {
        return reply.code(401).send({
          error: 'Unauthorized',
          reason: authHeader ? 'invalid_token' : 'missing_authorization',
          message: err instanceof Error ? err.message : String(err || '')
        });
      }
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });
};

export default authPlugin;
