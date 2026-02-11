import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma.js';

const collectionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/collections', async () => {
    const items = await prisma.collection.findMany({
      orderBy: [{ updatedAt: 'desc' }]
    });
    return items;
  });

  fastify.get('/collections/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const item = await prisma.collection.findUnique({ where: { id } });
    if (!item) return reply.code(404).send({ error: 'Not found' });
    return item;
  });

  fastify.get('/collections/:id/updates', async (request) => {
    const { id } = request.params as { id: string };
    return prisma.collectionUpdate.findMany({
      where: { collectionId: id },
      orderBy: [{ detectedAt: 'desc' }]
    });
  });
};

export default collectionRoutes;
