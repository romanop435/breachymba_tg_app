import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { getCache, setCache } from '../lib/cache.js';
import { NewsPostType, PatchRefType, SourceType } from '@prisma/client';

const feedRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/feed', async (request) => {
    const { filter = 'all', page = '1', limit = '20' } = request.query as Record<string, string>;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const cacheKey = `feed:${filter}:${pageNum}:${limitNum}`;
    const cached = getCache<any>(cacheKey);
    if (cached) return cached;

    const where: any = {
      isHidden: false,
      publishedAt: { not: null }
    };

    if (filter === 'manual') where.type = NewsPostType.MANUAL;
    if (filter === 'workshop') where.type = NewsPostType.AUTO_WORKSHOP;
    if (filter === 'collections') where.type = NewsPostType.AUTO_COLLECTION;
    if (filter === 'servers') where.type = NewsPostType.AUTO_SERVER;

    const [total, pinned, items] = await Promise.all([
      prisma.newsPost.count({ where }),
      pageNum === 1
        ? prisma.newsPost.findMany({
            where: { ...where, isPinned: true },
            orderBy: [{ publishedAt: 'desc' }]
          })
        : Promise.resolve([]),
      prisma.newsPost.findMany({
        where: { ...where, isPinned: false },
        orderBy: [{ publishedAt: 'desc' }],
        skip: (pageNum - 1) * limitNum,
        take: limitNum
      })
    ]);

    const all = [...pinned, ...items];
    const patchMap = await fetchPatchNoteMap(all);

    const response = {
      pinned: pinned.map((item) => ({ ...item, hasPatchNotes: patchMap.get(item.id) || false })),
      items: items.map((item) => ({ ...item, hasPatchNotes: patchMap.get(item.id) || false })),
      page: pageNum,
      limit: limitNum,
      total
    };
    setCache(cacheKey, response, 15000);
    return response;
  });

  fastify.get('/news/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const post = await prisma.newsPost.findUnique({ where: { id } });
    if (!post) return reply.code(404).send({ error: 'Not found' });

    const patchNotes = await fetchPatchNotesForPost(post);
    return { ...post, patchNotes };
  });
};

async function fetchPatchNoteMap(posts: Array<{ id: string; type: NewsPostType; sourceType: SourceType | null; sourceId: string | null }>) {
  const keys: { refType: PatchRefType; refId: string }[] = [];
  for (const post of posts) {
    if (post.type === NewsPostType.MANUAL) {
      keys.push({ refType: PatchRefType.NEWS_POST, refId: post.id });
      continue;
    }
    if (post.type === NewsPostType.AUTO_WORKSHOP && post.sourceId) {
      keys.push({ refType: PatchRefType.WORKSHOP_UPDATE, refId: post.sourceId });
    }
    if (post.type === NewsPostType.AUTO_COLLECTION && post.sourceId) {
      keys.push({ refType: PatchRefType.COLLECTION_UPDATE, refId: post.sourceId });
    }
    if (post.type === NewsPostType.AUTO_SERVER && post.sourceId) {
      keys.push({ refType: PatchRefType.SERVER, refId: post.sourceId });
    }
  }

  const patchNotes = keys.length
    ? await prisma.patchNote.findMany({
        where: {
          OR: keys.map((key) => ({ refType: key.refType, refId: key.refId }))
        }
      })
    : [];

  const map = new Map<string, boolean>();
  for (const post of posts) {
    let has = false;
    if (post.type === NewsPostType.MANUAL) {
      has = patchNotes.some((note) => note.refType === PatchRefType.NEWS_POST && note.refId === post.id);
    } else if (post.type === NewsPostType.AUTO_WORKSHOP && post.sourceId) {
      has = patchNotes.some((note) => note.refType === PatchRefType.WORKSHOP_UPDATE && note.refId === post.sourceId);
    } else if (post.type === NewsPostType.AUTO_COLLECTION && post.sourceId) {
      has = patchNotes.some((note) => note.refType === PatchRefType.COLLECTION_UPDATE && note.refId === post.sourceId);
    } else if (post.type === NewsPostType.AUTO_SERVER && post.sourceId) {
      has = patchNotes.some((note) => note.refType === PatchRefType.SERVER && note.refId === post.sourceId);
    }
    map.set(post.id, has);
  }
  return map;
}

async function fetchPatchNotesForPost(post: { id: string; type: NewsPostType; sourceId: string | null }) {
  if (post.type === NewsPostType.MANUAL) {
    return prisma.patchNote.findMany({ where: { refType: PatchRefType.NEWS_POST, refId: post.id } });
  }
  if (post.type === NewsPostType.AUTO_WORKSHOP && post.sourceId) {
    return prisma.patchNote.findMany({ where: { refType: PatchRefType.WORKSHOP_UPDATE, refId: post.sourceId } });
  }
  if (post.type === NewsPostType.AUTO_COLLECTION && post.sourceId) {
    return prisma.patchNote.findMany({ where: { refType: PatchRefType.COLLECTION_UPDATE, refId: post.sourceId } });
  }
  if (post.type === NewsPostType.AUTO_SERVER && post.sourceId) {
    return prisma.patchNote.findMany({ where: { refType: PatchRefType.SERVER, refId: post.sourceId } });
  }
  return [];
}

export default feedRoutes;
