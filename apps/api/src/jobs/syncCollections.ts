import { prisma } from '../lib/prisma.js';
import { fetchCollectionDetails } from '../lib/steam.js';
import { buildCollectionAutoPost } from '../lib/newsTemplates.js';
import { sleep } from './utils.js';

export async function syncCollections() {
  const collections = await prisma.collection.findMany();
  if (!collections.length) return;

  const idMap = new Map(collections.map((col) => [col.collectionId, col]));
  const ids = collections.map((col) => col.collectionId);
  const batchSize = 25;

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    try {
      const details = await fetchCollectionDetails(batch);
      for (const detail of details) {
        const collection = idMap.get(detail.publishedfileid);
        if (!collection) continue;

        const updatedAt = detail.time_updated ? new Date(detail.time_updated * 1000) : null;
        const lastChangeAt = collection.lastChangeAt;
        if (updatedAt && lastChangeAt && updatedAt <= lastChangeAt) continue;

        const changeLines: string[] = [];
        if (collection.title !== detail.title) changeLines.push(`Title: "${collection.title}" -> "${detail.title}"`);
        if (detail.children?.length) changeLines.push(`Items: ${detail.children.length}`);
        if (updatedAt) changeLines.push(`Updated at ${updatedAt.toISOString()}`);

        const update = await prisma.collectionUpdate.create({
          data: {
            collectionId: collection.id,
            detectedAt: new Date(),
            changeJson: {
              prev: { title: collection.title, lastChangeAt },
              next: { title: detail.title, updatedAt, items: detail.children?.length || 0 },
              meta: detail
            }
          }
        });

        await prisma.collection.update({
          where: { id: collection.id },
          data: {
            title: detail.title || collection.title,
            lastChangeAt: updatedAt,
            metaJson: detail
          }
        });

        const news = buildCollectionAutoPost({
          title: detail.title || collection.title,
          collectionId: detail.publishedfileid,
          detectedAt: new Date(),
          changeLines,
          sourceId: update.id
        });

        await prisma.newsPost.create({ data: news });
      }
    } catch (err) {
      console.error('Collection sync error', err);
    }

    await sleep(500);
  }
}
