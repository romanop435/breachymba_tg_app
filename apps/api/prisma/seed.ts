import { PrismaClient, NewsPostType, SourceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  const news1 = await prisma.newsPost.create({
    data: {
      type: NewsPostType.MANUAL,
      title: 'Breachymba Blog online',
      summary: 'We just rolled out the new hub. Expect rapid updates.',
      body: 'Welcome to BREACHYMBA BLOG. This hub aggregates manual posts, Workshop updates, and server status in one place.',
      tags: ['MANUAL', 'LAUNCH'],
      isPinned: true,
      publishedAt: now
    }
  });

  await prisma.newsPost.create({
    data: {
      type: NewsPostType.MANUAL,
      title: 'New containment UI pass',
      summary: 'A small UI polish drop with improved micro-interactions.',
      body: 'Buttons now have spring easing and cards lift subtly. This is the baseline for all upcoming pages.',
      tags: ['MANUAL', 'UPDATE'],
      publishedAt: now
    }
  });

  const workshop1 = await prisma.workshopItem.create({
    data: {
      workshopFileId: '1234567890',
      title: 'Breachymba Core Systems',
      lastUpdateAt: now,
      metaJson: { note: 'Seed item' }
    }
  });

  await prisma.workshopItem.create({
    data: {
      workshopFileId: '2345678901',
      title: 'Breachymba Containment Props',
      lastUpdateAt: now,
      metaJson: { note: 'Seed item' }
    }
  });

  const collection = await prisma.collection.create({
    data: {
      collectionId: '9988776655',
      title: 'Breachymba Official Collection',
      lastChangeAt: now,
      metaJson: { note: 'Seed collection' }
    }
  });

  const collectionUpdate = await prisma.collectionUpdate.create({
    data: {
      collectionId: collection.id,
      changeJson: { action: 'seed', itemCount: 12 },
      detectedAt: now
    }
  });

  const workshopUpdate = await prisma.workshopUpdate.create({
    data: {
      workshopItemId: workshop1.id,
      changeJson: { action: 'seed', version: '1.0.0' },
      detectedAt: now
    }
  });

  await prisma.server.createMany({
    data: [
      {
        title: 'BREACHYMBA RU #1',
        ip: '127.0.0.1',
        port: 27015,
        tags: ['RU', 'LIVE'],
        sortOrder: 1
      },
      {
        title: 'BREACHYMBA EU #1',
        ip: '127.0.0.1',
        port: 27016,
        tags: ['EU', 'TEST'],
        sortOrder: 2
      }
    ]
  });

  await prisma.newsPost.create({
    data: {
      type: NewsPostType.AUTO_WORKSHOP,
      title: 'Addon updated: Breachymba Core Systems',
      summary: 'Detected update at ' + now.toISOString() + '. Tap for details.',
      body: 'Key changes: Initial seed data. Link: https://steamcommunity.com/sharedfiles/filedetails/?id=1234567890',
      tags: ['AUTO', 'WORKSHOP', 'UPDATE'],
      sourceType: SourceType.WORKSHOP,
      sourceId: workshopUpdate.id,
      publishedAt: now
    }
  });

  await prisma.newsPost.create({
    data: {
      type: NewsPostType.AUTO_COLLECTION,
      title: 'Collection changed: Breachymba Official Collection',
      summary: 'Detected update at ' + now.toISOString() + '. Tap for details.',
      body: 'Key changes: Seed collection created. Link: https://steamcommunity.com/sharedfiles/filedetails/?id=9988776655',
      tags: ['AUTO', 'COLLECTION', 'UPDATE'],
      sourceType: SourceType.COLLECTION,
      sourceId: collectionUpdate.id,
      publishedAt: now
    }
  });

  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
