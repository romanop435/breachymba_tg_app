-- This migration was generated manually for the initial schema.

CREATE TYPE "NewsPostType" AS ENUM ('MANUAL', 'AUTO_WORKSHOP', 'AUTO_COLLECTION', 'AUTO_SERVER');
CREATE TYPE "SourceType" AS ENUM ('WORKSHOP', 'COLLECTION', 'SERVER');
CREATE TYPE "PatchRefType" AS ENUM ('WORKSHOP_ITEM', 'WORKSHOP_UPDATE', 'COLLECTION', 'COLLECTION_UPDATE', 'SERVER', 'NEWS_POST');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "telegramId" TEXT NOT NULL UNIQUE,
  "username" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "discordId" TEXT,
  "discordUsername" TEXT,
  "discordAvatar" TEXT
);

CREATE TABLE "NewsPost" (
  "id" TEXT PRIMARY KEY,
  "type" "NewsPostType" NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "tags" TEXT[] NOT NULL,
  "sourceType" "SourceType",
  "sourceId" TEXT,
  "isPinned" BOOLEAN NOT NULL DEFAULT FALSE,
  "isHidden" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "publishedAt" TIMESTAMPTZ
);

CREATE INDEX "NewsPost_type_idx" ON "NewsPost"("type");
CREATE INDEX "NewsPost_isPinned_idx" ON "NewsPost"("isPinned");
CREATE INDEX "NewsPost_publishedAt_idx" ON "NewsPost"("publishedAt");

CREATE TABLE "PatchNote" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "markdown" TEXT NOT NULL,
  "refType" "PatchRefType" NOT NULL,
  "refId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX "PatchNote_ref_idx" ON "PatchNote"("refType", "refId");

CREATE TABLE "WorkshopItem" (
  "id" TEXT PRIMARY KEY,
  "workshopFileId" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "lastUpdateAt" TIMESTAMPTZ,
  "metaJson" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "WorkshopUpdate" (
  "id" TEXT PRIMARY KEY,
  "workshopItemId" TEXT NOT NULL,
  "detectedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "changeJson" JSONB NOT NULL,
  "versionLabel" TEXT
);

CREATE INDEX "WorkshopUpdate_item_idx" ON "WorkshopUpdate"("workshopItemId");

CREATE TABLE "Collection" (
  "id" TEXT PRIMARY KEY,
  "collectionId" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "lastChangeAt" TIMESTAMPTZ,
  "metaJson" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "CollectionUpdate" (
  "id" TEXT PRIMARY KEY,
  "collectionId" TEXT NOT NULL,
  "detectedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "changeJson" JSONB NOT NULL
);

CREATE INDEX "CollectionUpdate_collection_idx" ON "CollectionUpdate"("collectionId");

CREATE TABLE "Server" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "ip" TEXT NOT NULL,
  "port" INTEGER NOT NULL,
  "tags" TEXT[] NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "ServerSnapshot" (
  "id" TEXT PRIMARY KEY,
  "serverId" TEXT NOT NULL,
  "checkedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "isOnline" BOOLEAN NOT NULL,
  "players" INTEGER NOT NULL,
  "maxPlayers" INTEGER NOT NULL,
  "map" TEXT,
  "ping" INTEGER,
  "rawJson" JSONB
);

CREATE INDEX "ServerSnapshot_server_idx" ON "ServerSnapshot"("serverId", "checkedAt");

ALTER TABLE "WorkshopUpdate"
  ADD CONSTRAINT "WorkshopUpdate_workshopItemId_fkey" FOREIGN KEY ("workshopItemId") REFERENCES "WorkshopItem"("id") ON DELETE CASCADE;

ALTER TABLE "CollectionUpdate"
  ADD CONSTRAINT "CollectionUpdate_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE;

ALTER TABLE "ServerSnapshot"
  ADD CONSTRAINT "ServerSnapshot_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server"("id") ON DELETE CASCADE;
