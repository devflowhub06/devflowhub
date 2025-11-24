/*
  Warnings:

  - You are about to drop the column `tokensUsed` on the `UsageLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."UsageLog" DROP COLUMN "tokensUsed";
