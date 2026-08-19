-- Cloud AIs: server-side entitlements (plan + credit tracking).
--
-- This table is the single source of truth for what a customer is allowed
-- to generate. It is never written to by the client directly (RLS below
-- only grants SELECT to the owning user) -- only Edge Functions using the
-- service_role key may write to it, after verifying either a LemonSqueezy
-- webhook signature or a Supabase-authenticated JWT.

create table if not exists public.entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'single', 'all_access', 'lifetime')),
  single_app_id text check (single_app_id in ('dealDossier', 'contentForge', 'talentPulse', 'commerceLens')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired')),
  free_credits_used integer not null default 0,
  free_credits_limit integer not null default 5,
  lemonsqueezy_customer_id text,
  lemonsqueezy_subscription_id text,
  lemonsqueezy_order_id text,
  updated_at timestamptz not null default now()
);

alter table public.entitlements enable row level security;

create policy "Users can read their own entitlement"
  on public.entitlements for select
  using (auth.uid() = user_id);

-- No insert/update/delete policy is granted to the authenticated role on
-- purpose: only the service_role key (used exclusively inside Edge
-- Functions, never shipped to the browser) can change plan or credits.

-- Auto-create a free-tier row the moment someone signs up, so the app
-- never has to special-case "no entitlement row yet".
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.entitlements (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create index if not exists entitlements_lemonsqueezy_subscription_idx
  on public.entitlements (lemonsqueezy_subscription_id);
