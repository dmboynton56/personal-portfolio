-- LLM Advisor signal/order lifecycle events for portfolio evidence.

create table if not exists llm_advisor_order_events (
  event_uid text primary key,
  run_date date not null references llm_advisor_backtest_runs(run_date) on delete cascade,
  event_ts timestamptz not null,
  event_type text not null,
  symbol text not null,
  loop_count integer,
  setup_type text,
  side text,
  entry_price numeric,
  z_score numeric,
  order_id text,
  details jsonb not null default '{}'::jsonb,
  source_file text,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_llm_advisor_order_events_run_date
  on llm_advisor_order_events(run_date desc);

create index if not exists idx_llm_advisor_order_events_ts
  on llm_advisor_order_events(event_ts desc);

create index if not exists idx_llm_advisor_order_events_type
  on llm_advisor_order_events(event_type);

create index if not exists idx_llm_advisor_order_events_symbol
  on llm_advisor_order_events(symbol);

alter table llm_advisor_order_events enable row level security;

drop policy if exists "public read llm advisor order events" on llm_advisor_order_events;

create policy "public read llm advisor order events"
  on llm_advisor_order_events for select using (true);

grant select on table public.llm_advisor_order_events to anon, authenticated;
grant select, insert, update, delete on table public.llm_advisor_order_events to service_role;
