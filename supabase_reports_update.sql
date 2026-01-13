ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS involved_officers TEXT,
ADD COLUMN IF NOT EXISTS third_parties TEXT;