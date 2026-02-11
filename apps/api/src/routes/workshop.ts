import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma.js';

const workshopRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/workshop', async () => {
    const items = await prisma.workshopItem.findMany({
      orderBy: [{ updatedAt: 'desc' }]
    });
    return items;
  });

  fastify.get('/workshop/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const item = await prisma.workshopItem.findUnique({ where: { id } });
    if (!item) return reply.code(404).send({ error: 'Not found' });
    return item;
  });

  fastify.get('/workshop/:id/updates', async (request) => {
    const { id } = request.params as { id: string };
    return prisma.workshopUpdate.findMany({
      where: { workshopItemId: id },
      orderBy: [{ detectedAt: 'desc' }]
    });
  });
};

export default workshopRoutes;
