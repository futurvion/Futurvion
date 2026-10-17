CREATE TABLE "Lead" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "company" TEXT,
  "phone" TEXT,
  "service" TEXT NOT NULL,
  "budget" TEXT,
  "description" TEXT NOT NULL,
  "privacyConsent" BOOLEAN NOT NULL,
  "notificationSent" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AnalyticsEvent" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "type" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "visitorKey" TEXT NOT NULL,
  "sessionKey" TEXT NOT NULL,
  "referrerCategory" TEXT,
  "deviceCategory" TEXT,
  "consent" BOOLEAN NOT NULL,
  CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AbuseAttempt" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AbuseAttempt_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
CREATE UNIQUE INDEX "AnalyticsEvent_eventId_key" ON "AnalyticsEvent"("eventId");
CREATE INDEX "AnalyticsEvent_createdAt_type_idx" ON "AnalyticsEvent"("createdAt", "type");
CREATE INDEX "AnalyticsEvent_visitorKey_createdAt_idx" ON "AnalyticsEvent"("visitorKey", "createdAt");
CREATE INDEX "AnalyticsEvent_sessionKey_createdAt_idx" ON "AnalyticsEvent"("sessionKey", "createdAt");
CREATE INDEX "AnalyticsEvent_path_createdAt_idx" ON "AnalyticsEvent"("path", "createdAt");
CREATE INDEX "AbuseAttempt_key_kind_createdAt_idx" ON "AbuseAttempt"("key", "kind", "createdAt");
CREATE INDEX "AbuseAttempt_createdAt_idx" ON "AbuseAttempt"("createdAt");
