-- Add only public job metadata. No resume/profile/embedding/match persistence.
BEGIN;
ALTER TABLE "Job"
  ADD COLUMN "requiredSkills" TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN "preferredSkills" TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN "experienceMinMonths" INTEGER,
  ADD COLUMN "experienceMaxMonths" INTEGER,
  ADD COLUMN "experienceMandatory" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "qualifications" TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN "searchDocument" tsvector;
ALTER TABLE "Job" ADD CONSTRAINT "Job_experience_check" CHECK (
  ("experienceMinMonths" IS NULL OR "experienceMinMonths" >= 0) AND
  ("experienceMaxMonths" IS NULL OR "experienceMaxMonths" >= 0) AND
  ("experienceMinMonths" IS NULL OR "experienceMaxMonths" IS NULL OR "experienceMaxMonths" >= "experienceMinMonths")
);
CREATE FUNCTION set_job_search_document() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW."searchDocument" :=
    setweight(to_tsvector('english', coalesce(NEW.title, '') || ' ' || array_to_string(NEW."requiredSkills", ' ')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW."companyName", '') || ' ' || coalesce(NEW.category, '') || ' ' || array_to_string(NEW."preferredSkills", ' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.requirements, '') || ' ' || coalesce(NEW."descriptionText", '')), 'D');
  RETURN NEW;
END;
$$;
CREATE TRIGGER job_search_document_before_write
BEFORE INSERT OR UPDATE OF title, "companyName", category, requirements, "descriptionText", "requiredSkills", "preferredSkills" ON "Job"
FOR EACH ROW EXECUTE FUNCTION set_job_search_document();
-- Populate the search index for the catalogue already present.
UPDATE "Job" SET title = title;
CREATE INDEX "Job_searchDocument_gin" ON "Job" USING GIN ("searchDocument");
CREATE INDEX "Job_requiredSkills_idx" ON "Job" USING GIN ("requiredSkills");
CREATE INDEX "Job_status_expiresAt_idx" ON "Job" (status, "expiresAt");
CREATE INDEX "Job_status_experienceMinMonths_idx" ON "Job" (status, "experienceMinMonths");
COMMIT;
