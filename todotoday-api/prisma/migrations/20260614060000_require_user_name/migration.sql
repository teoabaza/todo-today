-- Backfill any existing NULL names before enforcing NOT NULL
UPDATE "users" SET "name" = 'User' WHERE "name" IS NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;
