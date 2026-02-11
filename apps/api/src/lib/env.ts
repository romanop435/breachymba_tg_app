export const env = {
  port: Number(process.env.PORT || 3001),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'change-me',
  telegramBotToken: (process.env.TELEGRAM_BOT_TOKEN || '')
    .trim()
    .replace(/^['"]+|['"]+$/g, ''),
  telegramDebug: (process.env.TELEGRAM_DEBUG || 'false') === 'true',
  adminTelegramIds: (process.env.ADMIN_TELEGRAM_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean),
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5173',
  discordClientId: process.env.DISCORD_CLIENT_ID || '',
  discordClientSecret: process.env.DISCORD_CLIENT_SECRET || '',
  discordRedirectUri: process.env.DISCORD_REDIRECT_URI || 'http://localhost:3001/auth/discord/callback',
  redisUrl: process.env.REDIS_URL || '',
  cronEnabled: (process.env.CRON_ENABLED || 'true') === 'true',
  serverOfflineThreshold: Number(process.env.SERVER_OFFLINE_THRESHOLD || 3)
};
