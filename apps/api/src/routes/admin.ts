import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { NewsPostType, PatchRefType } from '@prisma/client';

const newsSchema = z.object({
  type: z.nativeEnum(NewsPostType).optional().default(NewsPostType.MANUAL),
  title: z.string().min(2),
  summary: z.string().min(2),
  body: z.string().min(2),
  tags: z.array(z.string()).default([]),
  publishedAt: z.string().datetime().optional().nullable(),
  isPinned: z.boolean().optional().default(false),
  isHidden: z.boolean().optional().default(false)
});

const patchSchema = z.object({
  title: z.string().min(2),
  markdown: z.string().min(2),
  refType: z.nativeEnum(PatchRefType),
  refId: z.string().min(1)
});

const workshopSchema = z.object({
  workshopFileId: z.string().min(3),
  title: z.string().min(2).optional()
});

const collectionSchema = z.object({
  collectionId: z.string().min(3),
  title: z.string().min(2).optional()
});

const serverSchema = z.object({
  title: z.string().min(2),
  ip: z.string().min(3),
  port: z.number().int(),
  tags: z.array(z.string()).default([]),
  sortOrder: z.number().int().default(0),
  isEnabled: z.boolean().default(true)
});

const adminRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/admin/news', { preHandler: fastify.requireAdmin }, async () => {
    return prisma.newsPost.findMany({ orderBy: [{ createdAt: 'desc' }] });
  });

  fastify.post('/admin/news', { preHandler: fastify.requireAdmin }, async (request) => {
    const data = newsSchema.parse(request.body);
    return prisma.newsPost.create({
      data: {
        ...data,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null
      }
    });
  });

  fastify.put('/admin/news/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = newsSchema.partial().parse(request.body);
    try {
      return await prisma.newsPost.update({
        where: { id },
        data: {
          ...data,
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : data.publishedAt === null ? null : undefined
        }
      });
    } catch {
      return reply.code(404).send({ error: 'Not found' });
    }
  });

  fastify.delete('/admin/news/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.newsPost.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Not found' });
    }
  });

  fastify.post('/admin/news/:id/pin', { preHandler: fastify.requireAdmin }, async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as { isPinned?: boolean };
    return prisma.newsPost.update({
      where: { id },
      data: { isPinned: body?.isPinned ?? true }
    });
  });

  fastify.post('/admin/news/:id/hide', { preHandler: fastify.requireAdmin }, async (request) => {
    const { id } = request.params as { id: string };
    const body = request.body as { isHidden?: boolean };
    return prisma.newsPost.update({
      where: { id },
      data: { isHidden: body?.isHidden ?? true }
    });
  });

  fastify.get('/admin/patchnotes', { preHandler: fastify.requireAdmin }, async () => {
    return prisma.patchNote.findMany({ orderBy: [{ createdAt: 'desc' }] });
  });

  fastify.post('/admin/patchnotes', { preHandler: fastify.requireAdmin }, async (request) => {
    const data = patchSchema.parse(request.body);
    return prisma.patchNote.create({ data });
  });

  fastify.put('/admin/patchnotes/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = patchSchema.partial().parse(request.body);
    try {
      return await prisma.patchNote.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Not found' });
    }
  });

  fastify.delete('/admin/patchnotes/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.patchNote.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Not found' });
    }
  });

  fastify.post('/admin/sources/workshop', { preHandler: fastify.requireAdmin }, async (request) => {
    const data = workshopSchema.parse(request.body);
    return prisma.workshopItem.create({
      data: {
        workshopFileId: data.workshopFileId,
        title: data.title || `Workshop ${data.workshopFileId}`
      }
    });
  });

  fastify.put('/admin/sources/workshop/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = workshopSchema.partial().parse(request.body);
    try {
      return await prisma.workshopItem.update({
        where: { id },
        data: {
          workshopFileId: data.workshopFileId,
          title: data.title
        }
      });
    } catch {
      return reply.code(404).send({ error: 'Not found' });
    }
  });

  fastify.delete('/admin/sources/workshop/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.workshopItem.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Not found' });
    }
  });

  fastify.post('/admin/sources/collections', { preHandler: fastify.requireAdmin }, async (request) => {
    const data = collectionSchema.parse(request.body);
    return prisma.collection.create({
      data: {
        collectionId: data.collectionId,
        title: data.title || `Collection ${data.collectionId}`
      }
    });
  });

  fastify.put('/admin/sources/collections/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = collectionSchema.partial().parse(request.body);
    try {
      return await prisma.collection.update({
        where: { id },
        data: {
          collectionId: data.collectionId,
          title: data.title
        }
      });
    } catch {
      return reply.code(404).send({ error: 'Not found' });
    }
  });

  fastify.delete('/admin/sources/collections/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.collection.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Not found' });
    }
  });

  fastify.post('/admin/servers', { preHandler: fastify.requireAdmin }, async (request) => {
    const data = serverSchema.parse(request.body);
    return prisma.server.create({ data });
  });

  fastify.get('/admin/servers', { preHandler: fastify.requireAdmin }, async () => {
    return prisma.server.findMany({ orderBy: [{ sortOrder: 'asc' }] });
  });

  fastify.put('/admin/servers/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = serverSchema.partial().parse(request.body);
    try {
      return await prisma.server.update({ where: { id }, data });
    } catch {
      return reply.code(404).send({ error: 'Not found' });
    }
  });

  fastify.delete('/admin/servers/:id', { preHandler: fastify.requireAdmin }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.server.delete({ where: { id } });
      return { ok: true };
    } catch {
      return reply.code(404).send({ error: 'Not found' });
    }
  });
};

export default adminRoutes;
