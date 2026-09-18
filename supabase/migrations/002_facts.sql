-- Structured astrological facts (planet details, dignities, yogas, fired rules, transits)
-- stored with each report so pages render without recomputation. Nullable for older rows.
alter table public.person_reports add column if not exists facts jsonb;
