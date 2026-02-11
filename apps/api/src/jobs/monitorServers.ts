import { prisma } from '../lib/prisma.js';
import { env } from '../lib/env.js';
import { buildServerAutoPost } from '../lib/newsTemplates.js';
import gamedig from 'gamedig';

export async function monitorServers() {
  const servers = await prisma.server.findMany({ where: { isEnabled: true } });
  for (const server of servers) {
    let snapshot: {
      isOnline: boolean;
      players: number;
      maxPlayers: number;
      map?: string | null;
      ping?: number | null;
      rawJson?: any;
    };

    try {
      const result = await gamedig.query({
        type: 'garrysmod',
        host: server.ip,
        port: server.port,
        maxAttempts: 1,
        socketTimeout: 2000
      });

      snapshot = {
        isOnline: true,
        players: result.players?.length || 0,
        maxPlayers: result.maxplayers || 0,
        map: result.map || null,
        ping: result.ping || null,
        rawJson: result
      };
    } catch (err) {
      snapshot = {
        isOnline: false,
        players: 0,
        maxPlayers: 0,
        map: null,
        ping: null,
        rawJson: { error: 'offline' }
      };
    }

    const history = await prisma.serverSnapshot.findMany({
      where: { serverId: server.id },
      orderBy: [{ checkedAt: 'desc' }],
      take: env.serverOfflineThreshold
    });

    const wasOffline = history.length >= env.serverOfflineThreshold && history.every((s) => !s.isOnline);

    const newSnapshot = await prisma.serverSnapshot.create({
      data: {
        serverId: server.id,
        checkedAt: new Date(),
        isOnline: snapshot.isOnline,
        players: snapshot.players,
        maxPlayers: snapshot.maxPlayers,
        map: snapshot.map,
        ping: snapshot.ping,
        rawJson: snapshot.rawJson
      }
    });

    const total = await prisma.serverSnapshot.count({ where: { serverId: server.id } });
    if (total > 50) {
      const toDelete = await prisma.serverSnapshot.findMany({
        where: { serverId: server.id },
        orderBy: [{ checkedAt: 'asc' }],
        take: total - 50
      });
      await prisma.serverSnapshot.deleteMany({ where: { id: { in: toDelete.map((s) => s.id) } } });
    }

    if (snapshot.isOnline && wasOffline) {
      const news = buildServerAutoPost({
        title: server.title,
        detectedAt: new Date(),
        sourceId: server.id,
        status: 'back online'
      });
      await prisma.newsPost.create({ data: news });
    }

    if (!snapshot.isOnline && wasOffline === false && history.length) {
      // Optional: could add down event. Keep silent by default.
    }
  }
}
