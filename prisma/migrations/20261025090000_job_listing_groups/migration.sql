-- Retain every source record and deep link; group only the public listings.
BEGIN;

CREATE FUNCTION job_listing_key(company_name TEXT, job_title TEXT, job_location TEXT)
RETURNS TEXT LANGUAGE SQL IMMUTABLE PARALLEL SAFE AS $$
  SELECT encode(sha256(convert_to(jsonb_build_array(
    btrim(regexp_replace(lower(coalesce(company_name, '')), '[[:space:]]+', ' ', 'g')),
    btrim(regexp_replace(lower(coalesce(job_title, '')), '[[:space:]]+', ' ', 'g')),
    btrim(regexp_replace(lower(coalesce(job_location, '')), '[[:space:]]+', ' ', 'g'))
  )::text, 'UTF8')), 'hex');
$$;

ALTER TABLE "Job" ADD COLUMN "listingKey" TEXT NOT NULL DEFAULT '';

CREATE FUNCTION set_job_listing_key() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW."listingKey" := job_listing_key(NEW."companyName", NEW."title", NEW."location");
  RETURN NEW;
END;
$$;

CREATE TRIGGER job_listing_key_before_write
BEFORE INSERT OR UPDATE ON "Job"
FOR EACH ROW EXECUTE FUNCTION set_job_listing_key();

UPDATE "Job" SET "listingKey" = job_listing_key("companyName", "title", "location");
CREATE INDEX "Job_status_listingKey_idx" ON "Job"("status", "listingKey");

COMMIT;
