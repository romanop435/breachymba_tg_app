import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { verifyTelegramInitData } from '../lib/telegram.js';
import { env } from '../lib/env.js';
import { buildDiscordAuthUrl, exchangeDiscordCode, fetchDiscordUser } from '../lib/discord.js';
import crypto from 'crypto';

const stateStore = new Map<string, { userId: string; createdAt: number }>();

function createState(userId: string) {
  const state = crypto.randomBytes(16).toString('hex');
  stateStore.set(state, { userId, createdAt: Date.now() });
  return state;
}

function consumeState(state: string) {
  const entry = stateStore.get(state);
  if (!entry) return null;
  stateStore.delete(state);
  const maxAge = 10 * 60 * 1000;
  if (Date.now() - entry.createdAt > maxAge) return null;
  return entry.userId;
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/auth/telegram', async (request, reply) => {
    const body = request.body as { initData?: string };
    const initData = body?.initData || '';

    const result = verifyTelegramInitData(initData, env.telegramBotToken);
    if (!result.ok || !result.data?.user) {
      return reply.code(401).send({ error: 'Invalid initData' });
    }

    const tgUser = result.data.user;
    const telegramId = String(tgUser.id);
    const username = tgUser.username || `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim();

    const user = await prisma.user.upsert({
      where: { telegramId },
      update: { username },
      create: { telegramId, username }
    });

    const isAdmin = env.adminTelegramIds.includes(telegramId);
    const token = fastify.jwt.sign({ sub: user.id, telegramId, username, isAdmin }, { expiresIn: '2h' });

    return reply.send({ token, user, isAdmin });
  });

  fastify.get('/auth/discord/connect', { preHandler: fastify.authenticate }, async (request, reply) => {
    const userId = (request.user as any)?.sub as string;
    if (!env.discordClientId || !env.discordClientSecret) {
      return reply.code(400).send({ error: 'Discord OAuth not configured' });
    }
    const state = createState(userId);
    const url = buildDiscordAuthUrl({
      clientId: env.discordClientId,
      redirectUri: env.discordRedirectUri,
      state
    });
    return reply.redirect(url);
  });

  fastify.get('/auth/discord/url', { preHandler: fastify.authenticate }, async (request) => {
    const userId = (request.user as any)?.sub as string;
    if (!env.discordClientId || !env.discordClientSecret) {
      return { error: 'Discord OAuth not configured' };
    }
    const state = createState(userId);
    const url = buildDiscordAuthUrl({
      clientId: env.discordClientId,
      redirectUri: env.discordRedirectUri,
      state
    });
    return { url };
  });

  fastify.get('/auth/discord/callback', async (request, reply) => {
    const { code, state } = request.query as { code?: string; state?: string };
    if (!code || !state) return reply.code(400).send({ error: 'Missing code/state' });

    const userId = consumeState(state);
    if (!userId) return reply.code(400).send({ error: 'Invalid state' });

    try {
      const token = await exchangeDiscordCode({
        clientId: env.discordClientId,
        clientSecret: env.discordClientSecret,
        redirectUri: env.discordRedirectUri,
        code
      });

      const discordUser = await fetchDiscordUser(token.access_token);
      await prisma.user.update({
        where: { id: userId },
        data: {
          discordId: discordUser.id,
          discordUsername: `${discordUser.username}${discordUser.discriminator && discordUser.discriminator !== '0' ? `#${discordUser.discriminator}` : ''}`,
          discordAvatar: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null
        }
      });

      const redirectUrl = new URL(env.appBaseUrl + '/profile');
      redirectUrl.searchParams.set('discord', 'linked');
      return reply.redirect(redirectUrl.toString());
    } catch (err) {
      return reply.code(500).send({ error: 'Discord OAuth failed' });
    }
  });

  fastify.post('/auth/discord/disconnect', { preHandler: fastify.authenticate }, async (request, reply) => {
    const userId = (request.user as any)?.sub as string;
    await prisma.user.update({
      where: { id: userId },
      data: {
        discordId: null,
        discordUsername: null,
        discordAvatar: null
      }
    });
    return reply.send({ ok: true });
  });

  fastify.get('/me', { preHandler: fastify.authenticate }, async (request) => {
    const userId = (request.user as any)?.sub as string;
    const telegramId = (request.user as any)?.telegramId as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = env.adminTelegramIds.includes(telegramId);
    return { user, isAdmin };
  });
};

export default authRoutes;
