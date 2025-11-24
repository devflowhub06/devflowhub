-- CreateEnum
CREATE TYPE "public"."ToolType" AS ENUM ('REPLIT', 'CURSOR', 'V0', 'BOLT');

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "activeTool" "public"."ToolType" NOT NULL DEFAULT 'REPLIT';

-- CreateTable
CREATE TABLE "public"."ReplitIntegration" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "replId" TEXT,
    "replUrl" TEXT,
    "embedUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'disconnected',
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReplitIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CursorWorkspace" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "rootPath" TEXT NOT NULL,
    "gitRemote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CursorWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."V0Workspace" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "components" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "V0Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BoltIntegration" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'vercel',
    "prodUrl" TEXT,
    "stagingUrl" TEXT,
    "lastDeployId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BoltIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReplitIntegration_projectId_key" ON "public"."ReplitIntegration"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "CursorWorkspace_projectId_key" ON "public"."CursorWorkspace"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "V0Workspace_projectId_key" ON "public"."V0Workspace"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "BoltIntegration_projectId_key" ON "public"."BoltIntegration"("projectId");

-- AddForeignKey
ALTER TABLE "public"."ReplitIntegration" ADD CONSTRAINT "ReplitIntegration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CursorWorkspace" ADD CONSTRAINT "CursorWorkspace_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."V0Workspace" ADD CONSTRAINT "V0Workspace_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BoltIntegration" ADD CONSTRAINT "BoltIntegration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
