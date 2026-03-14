-- LLM Advisor telemetry schema for dashboard metrics
-- Stores backtest summaries, per-trade records, and runtime heartbeat freshness.

create table if not exists llm_advisor_backtest_runs (
  run_date date primary key,
  total_trades integer not null default 0,
  closed_trades integer not null default 0,
  winning_trades integer not null default 0,
  losing_trades integer not null default 0,
  total_pnl numeric,
  average_win numeric,
  average_loss numeric,
  final_equity numeric,
  return_pct numeric,
  daily_return_pct numeric,
  win_rate numeric,
  source_file text,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_llm_advisor_runs_run_date
  on llm_advisor_backtest_runs(run_date desc);

create table if not exists llm_advisor_backtest_trades (
  trade_uid text primary key,
  run_date date not null references llm_advisor_backtest_runs(run_date) on delete cascade,
  order_id text,
  symbol text not null,
  side text,
  qty integer,
  entry_price numeric,
  stop_loss numeric,
  take_profit numeric,
  entry_time timestamptz,
  exit_time timestamptz,
  exit_price numeric,
  exit_reason text,
  pnl numeric,
  status text,
  source_file text,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_llm_advisor_trades_run_date
  on llm_advisor_backtest_trades(run_date desc);

create index if not exists idx_llm_advisor_trades_exit_time
  on llm_advisor_backtest_trades(exit_time desc);

create index if not exists idx_llm_advisor_trades_symbol
  on llm_advisor_backtest_trades(symbol);

create table if not exists llm_advisor_runtime_heartbeats (
  id bigserial primary key,
  source_date date not null,
  heartbeat_ts timestamptz not null,
  loop_count integer,
  symbols_tracked integer,
  backtest boolean not null default false,
  source_file text,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_date, heartbeat_ts)
);

create index if not exists idx_llm_advisor_heartbeats_ts
  on llm_advisor_runtime_heartbeats(heartbeat_ts desc);

-- Public read access for optional client-side querying.
alter table llm_advisor_backtest_runs enable row level security;
alter table llm_advisor_backtest_trades enable row level security;
alter table llm_advisor_runtime_heartbeats enable row level security;

drop policy if exists "public read llm advisor runs" on llm_advisor_backtest_runs;
drop policy if exists "public read llm advisor trades" on llm_advisor_backtest_trades;
drop policy if exists "public read llm advisor heartbeats" on llm_advisor_runtime_heartbeats;

create policy "public read llm advisor runs"
  on llm_advisor_backtest_runs for select using (true);

create policy "public read llm advisor trades"
  on llm_advisor_backtest_trades for select using (true);

create policy "public read llm advisor heartbeats"
  on llm_advisor_runtime_heartbeats for select using (true);
