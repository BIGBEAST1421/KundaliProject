-- Ask-a-question chat log: each entry is one Q&A pair, answered strictly from the report's
-- own computed facts. Capped at 15 per report in the API route, not enforced in SQL.
alter table public.person_reports add column if not exists questions jsonb not null default '[]'::jsonb;
