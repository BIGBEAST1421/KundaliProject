-- Cached translation of a report's AI-generated narrative into the other supported
-- language, filled in lazily the first time a viewer toggles the site language.
-- Nullable for rows that have never been requested in the other language.
alter table public.person_reports add column if not exists translation jsonb;
alter table public.match_reports  add column if not exists translation jsonb;
