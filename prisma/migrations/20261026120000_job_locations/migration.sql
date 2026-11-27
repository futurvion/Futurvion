-- Public job city centres only. No visitor coordinates or location history.
CREATE TABLE "JobLocation" (
  id UUID NOT NULL PRIMARY KEY,
  "jobId" UUID NOT NULL REFERENCES "Job"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "cityKey" TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  "countryCode" TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180)
);
CREATE UNIQUE INDEX "JobLocation_jobId_cityKey_key" ON "JobLocation" ("jobId", "cityKey");
CREATE INDEX "JobLocation_latitude_longitude_idx" ON "JobLocation" (latitude, longitude);

-- A direct source-location edit must not leave an old city searchable.
-- Sync recreates these derived rows after updating the parent job.
CREATE FUNCTION invalidate_job_locations() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.location IS DISTINCT FROM NEW.location OR OLD."countryCode" IS DISTINCT FROM NEW."countryCode" OR OLD."workMode" IS DISTINCT FROM NEW."workMode" THEN
    DELETE FROM "JobLocation" WHERE "jobId" = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER job_locations_after_source_change
AFTER UPDATE OF location, "countryCode", "workMode" ON "Job"
FOR EACH ROW EXECUTE FUNCTION invalidate_job_locations();
