-- CreateTable
CREATE TABLE "JobProvider" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "providerType" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "configuration" JSONB NOT NULL DEFAULT '{}',
    "lastSyncAt" TIMESTAMP(3),
    "lastSuccessAt" TIMESTAMP(3),
    "lastErrorAt" TIMESTAMP(3),
    "lastErrorSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyLogoUrl" TEXT,
    "location" TEXT,
    "countryCode" TEXT,
    "workMode" TEXT NOT NULL DEFAULT 'unknown',
    "employmentType" TEXT,
    "experienceLevel" TEXT,
    "category" TEXT,
    "descriptionText" TEXT,
    "requirements" TEXT,
    "responsibilities" TEXT,
    "benefits" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT,
    "salaryPeriod" TEXT,
    "applicationUrl" TEXT NOT NULL,
    "sourceProviderId" UUID NOT NULL,
    "externalJobId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "lastVerifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "contentHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSyncRun" (
    "id" UUID NOT NULL,
    "providerId" UUID,
    "triggerType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "jobsFetched" INTEGER NOT NULL DEFAULT 0,
    "jobsInserted" INTEGER NOT NULL DEFAULT 0,
    "jobsUpdated" INTEGER NOT NULL DEFAULT 0,
    "jobsUnchanged" INTEGER NOT NULL DEFAULT 0,
    "jobsExpired" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "errorSummary" TEXT,

    CONSTRAINT "JobSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSyncSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "frequencyMinutes" INTEGER NOT NULL DEFAULT 360,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "batchSize" INTEGER NOT NULL DEFAULT 100,
    "maxConcurrency" INTEGER NOT NULL DEFAULT 2,
    "retryLimit" INTEGER NOT NULL DEFAULT 2,
    "retryDelaySeconds" INTEGER NOT NULL DEFAULT 5,
    "expireAfterDays" INTEGER NOT NULL DEFAULT 14,
    "lastScheduledRunAt" TIMESTAMP(3),
    "nextScheduledRunAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSyncSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" UUID NOT NULL,
    "adminUserId" UUID NOT NULL,
    "sessionTokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobProvider_slug_key" ON "JobProvider"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "Job_status_publishedAt_idx" ON "Job"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Job_companyName_idx" ON "Job"("companyName");

-- CreateIndex
CREATE INDEX "Job_location_idx" ON "Job"("location");

-- CreateIndex
CREATE INDEX "Job_workMode_employmentType_idx" ON "Job"("workMode", "employmentType");

-- CreateIndex
CREATE UNIQUE INDEX "Job_sourceProviderId_externalJobId_key" ON "Job"("sourceProviderId", "externalJobId");

-- CreateIndex
CREATE INDEX "JobSyncRun_startedAt_idx" ON "JobSyncRun"("startedAt");

-- CreateIndex
CREATE INDEX "JobSyncRun_providerId_startedAt_idx" ON "JobSyncRun"("providerId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_sessionTokenHash_key" ON "AdminSession"("sessionTokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_adminUserId_expiresAt_idx" ON "AdminSession"("adminUserId", "expiresAt");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_sourceProviderId_fkey" FOREIGN KEY ("sourceProviderId") REFERENCES "JobProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSyncRun" ADD CONSTRAINT "JobSyncRun_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "JobProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Guard values that Prisma's portable schema cannot express.
ALTER TABLE "Job" ADD CONSTRAINT "Job_status_check" CHECK ("status" IN ('active','expired','archived','removed'));
ALTER TABLE "Job" ADD CONSTRAINT "Job_workMode_check" CHECK ("workMode" IN ('remote','hybrid','onsite','unknown'));
ALTER TABLE "Job" ADD CONSTRAINT "Job_salary_check" CHECK (("salaryMin" IS NULL OR "salaryMin" >= 0) AND ("salaryMax" IS NULL OR "salaryMax" >= 0) AND ("salaryMin" IS NULL OR "salaryMax" IS NULL OR "salaryMax" >= "salaryMin"));
ALTER TABLE "JobProvider" ADD CONSTRAINT "JobProvider_type_check" CHECK ("providerType" IN ('remotive','greenhouse','lever'));
ALTER TABLE "JobSyncRun" ADD CONSTRAINT "JobSyncRun_status_check" CHECK ("status" IN ('queued','running','succeeded','partial','failed'));
ALTER TABLE "JobSyncSettings" ADD CONSTRAINT "JobSyncSettings_singleton_check" CHECK ("id" = 1);
CREATE UNIQUE INDEX "JobSyncRun_one_running" ON "JobSyncRun" ((1)) WHERE "status" = 'running';
