import { prisma } from '../lib/prisma.js';
import { fetchPublishedFileDetails } from '../lib/steam.js';
import { buildWorkshopAutoPost } from '../lib/newsTemplates.js';
import { sleep } from './utils.js';

export async function syncWorkshopItems() {
  const items = await prisma.workshopItem.findMany();
  if (!items.length) return;

  const idMap = new Map(items.map((item) => [item.workshopFileId, item]));
  const ids = items.map((item) => item.workshopFileId);
  const batchSize = 50;

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    try {
      const details = await fetchPublishedFileDetails(batch);
      for (const detail of details) {
        const item = idMap.get(detail.publishedfileid);
        if (!item) continue;

        const updatedAt = detail.time_updated ? new Date(detail.time_updated * 1000) : null;
        const lastUpdateAt = item.lastUpdateAt;

        if (updatedAt && lastUpdateAt && updatedAt <= lastUpdateAt) continue;

        const changeLines: string[] = [];
        if (item.title !== detail.title) changeLines.push(`Title: "${item.title}" -> "${detail.title}"`);
        if (updatedAt) changeLines.push(`Updated at ${updatedAt.toISOString()}`);

        const update = await prisma.workshopUpdate.create({
          data: {
            workshopItemId: item.id,
            detectedAt: new Date(),
            changeJson: {
              prev: { title: item.title, lastUpdateAt },
              next: { title: detail.title, updatedAt },
              meta: detail
            }
          }
        });

        await prisma.workshopItem.update({
          where: { id: item.id },
          data: {
            title: detail.title || item.title,
            lastUpdateAt: updatedAt,
            metaJson: detail
          }
        });

        const news = buildWorkshopAutoPost({
          title: detail.title || item.title,
          workshopFileId: detail.publishedfileid,
          detectedAt: new Date(),
          changeLines,
          sourceId: update.id
        });

        await prisma.newsPost.create({ data: news });
      }
    } catch (err) {
      console.error('Workshop sync error', err);
    }

    await sleep(500);
  }
}
