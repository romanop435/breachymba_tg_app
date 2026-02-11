import { NewsPostType, SourceType } from '@prisma/client';

export function buildWorkshopAutoPost(params: {
  title: string;
  workshopFileId: string;
  detectedAt: Date;
  changeLines: string[];
  sourceId: string;
}) {
  const { title, workshopFileId, detectedAt, changeLines, sourceId } = params;
  return {
    type: NewsPostType.AUTO_WORKSHOP,
    title: `Addon updated: ${title}`,
    summary: `Detected update at ${detectedAt.toISOString()}. Tap for details.`,
    body: buildBody(changeLines, `https://steamcommunity.com/sharedfiles/filedetails/?id=${workshopFileId}`),
    tags: ['AUTO', 'WORKSHOP', 'UPDATE'],
    sourceType: SourceType.WORKSHOP,
    sourceId,
    publishedAt: detectedAt
  };
}

export function buildCollectionAutoPost(params: {
  title: string;
  collectionId: string;
  detectedAt: Date;
  changeLines: string[];
  sourceId: string;
}) {
  const { title, collectionId, detectedAt, changeLines, sourceId } = params;
  return {
    type: NewsPostType.AUTO_COLLECTION,
    title: `Collection changed: ${title}`,
    summary: `Detected update at ${detectedAt.toISOString()}. Tap for details.`,
    body: buildBody(changeLines, `https://steamcommunity.com/sharedfiles/filedetails/?id=${collectionId}`),
    tags: ['AUTO', 'COLLECTION', 'UPDATE'],
    sourceType: SourceType.COLLECTION,
    sourceId,
    publishedAt: detectedAt
  };
}

export function buildServerAutoPost(params: {
  title: string;
  detectedAt: Date;
  sourceId: string;
  status: string;
}) {
  const { title, detectedAt, sourceId, status } = params;
  return {
    type: NewsPostType.AUTO_SERVER,
    title: `Server ${status}: ${title}`,
    summary: `Detected status change at ${detectedAt.toISOString()}.`,
    body: `Status update: ${status}.`,
    tags: ['AUTO', 'SERVER', 'STATUS'],
    sourceType: SourceType.SERVER,
    sourceId,
    publishedAt: detectedAt
  };
}

function buildBody(lines: string[], link: string) {
  const safeLines = lines.slice(0, 3);
  const section = safeLines.length ? `Key changes:\n- ${safeLines.join('\n- ')}` : 'Key changes: (not provided)';
  return `${section}\n\nLink: ${link}`;
}
