-- Kundali: persistent structured reports.
-- Run once in the Supabase SQL editor. Access is server-side only (service role);
-- RLS is enabled with no policies so the anon key cannot read or write anything.

create extension if not exists "pgcrypto";

create table if not exists public.person_reports (
  uid         uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  language    text not null default 'en' check (language in ('en', 'hi')),
  birth       jsonb not null,
  profile     jsonb not null,
  pillars     text[] not null check (array_length(pillars, 1) between 1 and 4),
  chart       jsonb not null,
  core        jsonb not null,
  sections    jsonb not null,
  created_at  timestamptz not null default now()
);

create index if not exists person_reports_slug_prefix_idx on public.person_reports (slug text_pattern_ops);
create index if not exists person_reports_created_at_idx on public.person_reports (created_at desc);

create table if not exists public.match_reports (
  uid         uuid primary key default gen_random_uuid(),
  language    text not null default 'en' check (language in ('en', 'hi')),
  boy         jsonb not null,
  girl        jsonb not null,
  guna        jsonb not null,
  factors     jsonb not null,
  mangal      jsonb not null,
  insights    jsonb not null,
  created_at  timestamptz not null default now()
);

create index if not exists match_reports_created_at_idx on public.match_reports (created_at desc);

alter table public.person_reports enable row level security;
alter table public.match_reports  enable row level security;

-- The server uses the service_role key; make sure it can read/write regardless of who ran this file.
grant usage on schema public to service_role;
grant select, insert, update, delete on public.person_reports to service_role;
grant select, insert, update, delete on public.match_reports  to service_role;
