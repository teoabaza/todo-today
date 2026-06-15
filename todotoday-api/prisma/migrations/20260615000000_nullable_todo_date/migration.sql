-- AlterTable: make date column nullable to support "backlog" todos with no date
ALTER TABLE "todos" ALTER COLUMN "date" DROP NOT NULL;
