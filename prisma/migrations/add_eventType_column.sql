-- Migration: Add eventType column to AnalyticsEvent table
-- This migration adds the missing eventType column that was added to the schema
-- but not yet applied to the production database.

-- Add the eventType column (allowing NULL temporarily)
ALTER TABLE "AnalyticsEvent" 
ADD COLUMN IF NOT EXISTS "eventType" TEXT;

-- Set a default value for existing rows
UPDATE "AnalyticsEvent" 
SET "eventType" = 'user_action' 
WHERE "eventType" IS NULL;

-- Make the column NOT NULL now that all rows have values
ALTER TABLE "AnalyticsEvent" 
ALTER COLUMN "eventType" SET NOT NULL;

-- Add index on eventType for query performance
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_eventType_idx" ON "AnalyticsEvent"("eventType");

-- Verify the migration
SELECT COUNT(*) as total_events, "eventType", COUNT(DISTINCT "userId") as unique_users
FROM "AnalyticsEvent"
GROUP BY "eventType";

