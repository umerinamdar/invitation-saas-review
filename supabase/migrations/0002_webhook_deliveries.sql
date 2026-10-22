-- Add webhook_deliveries table for idempotency tracking
-- Prevents double-fulfillment when webhooks are retried

create table if not exists webhook_deliveries (
  id            uuid primary key default gen_random_uuid(),
  delivery_id   text not null unique,
  payload       jsonb not null,
  created_at    timestamptz not null default now()
);

create index if not exists webhook_deliveries_delivery_id_idx on webhook_deliveries (delivery_id);
create index if not exists webhook_deliveries_created_at_idx on webhook_deliveries (created_at desc);

-- Enable RLS (only server-side code should touch this)
alter table webhook_deliveries enable row level security;

-- No policies needed - only server functions write, no user reads
