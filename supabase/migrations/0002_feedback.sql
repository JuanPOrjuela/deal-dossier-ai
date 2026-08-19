-- Cloud AIs: contact / feedback messages submitted from the "Contact us"
-- form in the app footer.
--
-- Anyone (signed in or anonymous) can INSERT a message -- that's the whole
-- point of a contact form. Nobody can SELECT/UPDATE/DELETE from the client;
-- only the service_role key (Supabase dashboard / a future admin view) can
-- read these, so one visitor's message is never exposed to another.

create table if not exists public.feedback_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  email text not null,
  category text not null default 'question' check (category in ('question', 'suggestion', 'bug', 'other')),
  message text not null check (char_length(message) between 1 and 4000),
  app_context text check (app_context in ('dealDossier', 'contentForge', 'talentPulse', 'commerceLens')),
  language text
);

alter table public.feedback_messages enable row level security;

create policy "Anyone can submit feedback"
  on public.feedback_messages for insert
  to anon, authenticated
  with check (true);

-- No select/update/delete policy is granted on purpose: only the
-- service_role key (never shipped to the browser) can read submissions.

create index if not exists feedback_messages_created_at_idx
  on public.feedback_messages (created_at desc);
