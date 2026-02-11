import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma.js';

const serverRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/servers', async () => {
    const servers = await prisma.server.findMany({
      where: { isEnabled: true },
      orderBy: [{ sortOrder: 'asc' }]
    });

    if (!servers.length) return [];

    const snapshots = await prisma.serverSnapshot.findMany({
      where: { serverId: { in: servers.map((s) => s.id) } },
      orderBy: [{ checkedAt: 'desc' }]
    });

    const latestMap = new Map<string, (typeof snapshots)[number]>();
    for (const snapshot of snapshots) {
      if (!latestMap.has(snapshot.serverId)) {
        latestMap.set(snapshot.serverId, snapshot);
      }
    }

    return servers.map((server) => ({
      ...server,
      latestSnapshot: latestMap.get(server.id) || null
    }));
  });

  fastify.get('/servers/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const server = await prisma.server.findUnique({ where: { id } });
    if (!server) return reply.code(404).send({ error: 'Not found' });

    const latestSnapshot = await prisma.serverSnapshot.findFirst({
      where: { serverId: id },
      orderBy: [{ checkedAt: 'desc' }]
    });

    return { ...server, latestSnapshot };
  });

  fastify.get('/servers/:id/history', async (request) => {
    const { id } = request.params as { id: string };
    return prisma.serverSnapshot.findMany({
      where: { serverId: id },
      orderBy: [{ checkedAt: 'desc' }],
      take: 50
    });
  });
};

export default serverRoutes;
