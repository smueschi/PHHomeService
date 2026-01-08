-- STEP 23: ADD DOCUMENTS TO REQUESTS
-- Adds a JSONB column to store file URLs (Valid ID, NBI Clearance)

ALTER TABLE public.provider_requests 
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}'::jsonb;

-- Example: documents = { "valid_id": "url...", "nbi_clearance": "url..." }
