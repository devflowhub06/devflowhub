-- Fix UsageLog tool column type from String to ToolType enum
-- First, create a temporary column
ALTER TABLE "UsageLog" ADD COLUMN "tool_new" "ToolType";

-- Update the new column with converted values
UPDATE "UsageLog" SET "tool_new" = 
  CASE 
    WHEN "tool" = 'cursor' THEN 'CURSOR'::"ToolType"
    WHEN "tool" = 'replit' THEN 'REPLIT'::"ToolType"
    WHEN "tool" = 'v0' THEN 'V0'::"ToolType"
    WHEN "tool" = 'bolt' THEN 'BOLT'::"ToolType"
    WHEN "tool" = 'ai_assistant' THEN 'CURSOR'::"ToolType"
    ELSE 'CURSOR'::"ToolType" -- Default fallback
  END;

-- Drop the old column
ALTER TABLE "UsageLog" DROP COLUMN "tool";

-- Rename the new column to the original name
ALTER TABLE "UsageLog" RENAME COLUMN "tool_new" TO "tool";

-- Make the column NOT NULL again
ALTER TABLE "UsageLog" ALTER COLUMN "tool" SET NOT NULL;

-- Fix duration column name from duration to durationMs
ALTER TABLE "UsageLog" RENAME COLUMN "duration" TO "durationMs";

-- CreateIndex
CREATE INDEX "UsageLog_tool_createdAt_idx" ON "public"."UsageLog"("tool", "createdAt");
