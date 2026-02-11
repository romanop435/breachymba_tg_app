const STEAM_API_PUBLISHED_URL = 'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/';
const STEAM_API_COLLECTION_URL = 'https://api.steampowered.com/ISteamRemoteStorage/GetCollectionDetails/v1/';

export type SteamPublishedFile = {
  publishedfileid: string;
  title: string;
  description: string;
  time_updated: number;
  time_created: number;
  creator: string;
  file_size: string;
  file_url: string;
  preview_url: string;
};

export type SteamCollection = {
  publishedfileid: string;
  title: string;
  description: string;
  time_updated: number;
  time_created: number;
  children?: { publishedfileid: string; sortorder: number }[];
};

export async function fetchPublishedFileDetails(ids: string[]): Promise<SteamPublishedFile[]> {
  if (!ids.length) return [];
  const body = new URLSearchParams();
  body.set('itemcount', String(ids.length));
  ids.forEach((id, index) => body.set(`publishedfileids[${index}]`, id));

  const res = await fetch(STEAM_API_PUBLISHED_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!res.ok) throw new Error(`Steam API error: ${res.status}`);
  const json = await res.json();
  const details = json?.response?.publishedfiledetails || [];
  return details.map((item: any) => ({
    publishedfileid: item.publishedfileid,
    title: item.title,
    description: item.description,
    time_updated: Number(item.time_updated || 0),
    time_created: Number(item.time_created || 0),
    creator: item.creator,
    file_size: item.file_size,
    file_url: item.file_url,
    preview_url: item.preview_url
  }));
}

export async function fetchCollectionDetails(ids: string[]): Promise<SteamCollection[]> {
  if (!ids.length) return [];
  const body = new URLSearchParams();
  body.set('collectioncount', String(ids.length));
  ids.forEach((id, index) => body.set(`publishedfileids[${index}]`, id));

  const res = await fetch(STEAM_API_COLLECTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!res.ok) throw new Error(`Steam API error: ${res.status}`);
  const json = await res.json();
  const details = json?.response?.collectiondetails || [];
  return details.map((item: any) => ({
    publishedfileid: item.publishedfileid,
    title: item.title,
    description: item.description,
    time_updated: Number(item.time_updated || 0),
    time_created: Number(item.time_created || 0),
    children: item.children || []
  }));
}
