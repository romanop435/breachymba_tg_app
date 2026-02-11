import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../lib/env.js';

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  fastify.decorate('requireAdmin', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const telegramId = (request.user as any)?.telegramId as string | undefined;
      const isAdmin = telegramId && env.adminTelegramIds.includes(telegramId);
      if (!isAdmin) {
        return reply.code(403).send({ error: 'Forbidden' });
      }
    } catch (err) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
  });
};

export default authPlugin;
