-- Generic project metrics for deep-dive pages
-- Stores name/value pairs per project to drive the KPI strips.

create table if not exists project_metrics (
  id bigserial primary key,
  project_id text not null,
  metric_key text not null,
  label text not null,
  value text not null,
  icon_name text,
  trend text, -- 'up', 'down', 'neutral'
  updated_at timestamptz not null default now(),
  unique (project_id, metric_key)
);

create index if not exists idx_project_metrics_project_id
  on project_metrics(project_id);

alter table project_metrics enable row level security;

create policy "public read project metrics"
  on project_metrics for select using (true);
