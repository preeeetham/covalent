-- Covalent schema
-- Security model:
--   * RLS is enabled on EVERY table. Default is deny.
--   * Browser clients (anon key + user JWT) get narrow, member-scoped SELECT policies only
--     (needed for realtime chat / bond updates). They have NO insert/update/delete policies.
--   * All writes go through Next.js server actions that verify the session, validate input
--     with zod and check authorization, then use the service-role client.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  first_name text,
  dob date,
  gender text check (gender in ('man', 'woman', 'nonbinary')),
  interested_in text[] not null default '{}',
  city text,
  hometown text,
  role text,
  company text,
  intent text check (intent in ('serious', 'see', 'friends')),
  archetype text,
  verified boolean not null default false,
  is_demo boolean not null default false,
  is_evaluator boolean not null default false,
  is_admin boolean not null default false,
  reliability int not null default 50 check (reliability between 0 and 100),
  catalysts int not null default 0 check (catalysts >= 0),
  extra_slot_until timestamptz,
  onboarding_step int not null default 0,
  onboarded_at timestamptz,
  last_active_at timestamptz not null default now(),
  consent_terms_at timestamptz,
  consent_privacy_at timestamptz,
  consent_marketing boolean not null default false,
  persona jsonb,               -- demo persona voice + pre-authored answers (demo profiles only)
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);
create index profiles_match_idx on public.profiles (city, gender) where onboarded_at is not null and deleted_at is null;

-- ---------------------------------------------------------------- photos
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  position int not null default 0,
  path_original text not null,
  -- blur variants, heaviest first: [0] before any round, [1] after round 1, [2] after round 2, [3] after round 3
  path_blur text[] not null,
  created_at timestamptz not null default now()
);
create index photos_user_idx on public.photos (user_id, position);

-- ---------------------------------------------------------------- profile content
create table public.quiz_answers (
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id text not null,
  value int not null check (value between 1 and 5),
  primary key (user_id, question_id)
);

create table public.user_elements (
  user_id uuid not null references public.profiles (id) on delete cascade,
  element_id text not null,
  primary key (user_id, element_id)
);

create table public.user_prompts (
  user_id uuid not null references public.profiles (id) on delete cascade,
  prompt_id text not null,
  answer text not null check (char_length(answer) between 1 and 220),
  position int not null default 0,
  primary key (user_id, prompt_id)
);

-- ---------------------------------------------------------------- daily batches
create table public.batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  batch_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, batch_date)
);

create table public.batch_items (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  candidate_id uuid not null references public.profiles (id) on delete cascade,
  score int not null,
  reasons jsonb not null default '[]',
  why_text text,
  status text not null default 'pending' check (status in ('pending', 'reacted', 'passed')),
  pass_reason text,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index batch_items_user_idx on public.batch_items (user_id, created_at desc);

-- ---------------------------------------------------------------- bonds
create table public.bonds (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles (id) on delete cascade, -- who started the reaction
  user_b uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'invited'
    check (status in ('invited', 'active', 'revealed', 'declined', 'dissolved', 'expired')),
  round int not null default 0 check (round between 0 and 4), -- rounds fully completed by both
  chemistry int not null default 50 check (chemistry between 0 and 100),
  match_score int not null default 50,
  reasons jsonb not null default '[]',
  why_text text,
  reveal_a boolean not null default false,
  reveal_b boolean not null default false,
  last_move_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '72 hours',
  nudged_by uuid,
  persona_due_at timestamptz,     -- when a demo partner should make its next move
  dissolved_by uuid,
  dissolve_reason text,
  created_at timestamptz not null default now(),
  constraint bonds_distinct check (user_a <> user_b)
);
create unique index bonds_pair_idx on public.bonds (least(user_a, user_b), greatest(user_a, user_b));
create index bonds_a_idx on public.bonds (user_a, status);
create index bonds_b_idx on public.bonds (user_b, status);

create table public.round_responses (
  id uuid primary key default gen_random_uuid(),
  bond_id uuid not null references public.bonds (id) on delete cascade,
  round int not null check (round between 1 and 4),
  user_id uuid not null references public.profiles (id) on delete cascade,
  payload jsonb not null,
  submitted_at timestamptz,          -- null while a multi-step round is in progress (round 2)
  created_at timestamptz not null default now(),
  unique (bond_id, round, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  bond_id uuid not null references public.bonds (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  kind text not null default 'text' check (kind in ('text', 'reaction', 'system')),
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);
create index messages_bond_idx on public.messages (bond_id, created_at);

-- ---------------------------------------------------------------- dates & money
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  city text not null,
  name text not null,
  area text not null,
  kind text not null,
  blurb text,
  map_url text,
  price_band text,
  partner boolean not null default false,
  offer_text text
);

create table public.date_plans (
  id uuid primary key default gen_random_uuid(),
  bond_id uuid not null references public.bonds (id) on delete cascade,
  proposed_by uuid not null references public.profiles (id) on delete cascade,
  venue_id uuid not null references public.venues (id),
  starts_at timestamptz not null,
  status text not null default 'proposed'
    check (status in ('proposed', 'accepted', 'confirmed', 'completed', 'countered', 'cancelled', 'declined')),
  paid_a boolean not null default false,  -- bond.user_a paid commitment
  paid_b boolean not null default false,
  share_token text unique not null default encode(gen_random_bytes(12), 'hex'),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index date_plans_bond_idx on public.date_plans (bond_id, created_at desc);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('commitment', 'catalyst')),
  amount_inr int not null check (amount_inr > 0),
  provider text not null default 'mock',
  status text not null default 'created' check (status in ('created', 'paid', 'failed', 'refunded')),
  ref text,
  date_plan_id uuid references public.date_plans (id) on delete set null,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index payments_user_idx on public.payments (user_id, created_at desc);

create table public.date_feedback (
  date_plan_id uuid not null references public.date_plans (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  showed_up boolean not null,
  felt_safe boolean not null,
  meet_again boolean not null,
  note text,
  created_at timestamptz not null default now(),
  primary key (date_plan_id, user_id)
);

-- ---------------------------------------------------------------- trust & safety
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  target_id uuid references public.profiles (id) on delete set null,
  bond_id uuid references public.bonds (id) on delete set null,
  reason text not null,
  detail text,
  source text not null default 'user' check (source in ('user', 'feedback', 'system')),
  status text not null default 'open' check (status in ('open', 'resolved', 'actioned')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

-- ---------------------------------------------------------------- growth & analytics
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  city text not null,
  gender text,
  created_at timestamptz not null default now(),
  unique (email)
);

create table public.events (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete cascade,
  name text not null,
  props jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index events_name_idx on public.events (name, created_at);

create table public.rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  count int not null default 0
);

-- ================================================================ helpers
create or replace function public.is_bond_member(b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from bonds where id = b and auth.uid() in (user_a, user_b));
$$;

create or replace function public.is_blocked_pair(x uuid, y uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from blocks
    where (blocker_id = x and blocked_id = y) or (blocker_id = y and blocked_id = x)
  );
$$;

-- True when the caller is in the bond AND has submitted that round (security definer avoids RLS recursion).
create or replace function public.i_submitted_round(b uuid, r int)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_bond_member(b) and exists (
    select 1 from round_responses
    where bond_id = b and round = r and user_id = auth.uid() and submitted_at is not null
  );
$$;

-- Atomic fixed-window rate limiter used by server code (service role only).
create or replace function public.hit_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  r rate_limits%rowtype;
begin
  insert into rate_limits (key, window_start, count) values (p_key, now(), 1)
  on conflict (key) do update
    set count = case when rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
                     then 1 else rate_limits.count + 1 end,
        window_start = case when rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
                     then now() else rate_limits.window_start end
  returning * into r;
  return r.count <= p_limit; -- true = allowed
end;
$$;
revoke execute on function public.hit_rate_limit from public, anon, authenticated;

-- ================================================================ RLS
alter table public.profiles        enable row level security;
alter table public.photos          enable row level security;
alter table public.quiz_answers    enable row level security;
alter table public.user_elements   enable row level security;
alter table public.user_prompts    enable row level security;
alter table public.batches         enable row level security;
alter table public.batch_items     enable row level security;
alter table public.bonds           enable row level security;
alter table public.round_responses enable row level security;
alter table public.messages        enable row level security;
alter table public.venues          enable row level security;
alter table public.date_plans      enable row level security;
alter table public.payments        enable row level security;
alter table public.date_feedback   enable row level security;
alter table public.reports         enable row level security;
alter table public.blocks          enable row level security;
alter table public.waitlist        enable row level security;
alter table public.events          enable row level security;
alter table public.rate_limits     enable row level security;

-- Own rows only.
create policy "own profile"   on public.profiles      for select to authenticated using (id = auth.uid());
create policy "own photos"    on public.photos        for select to authenticated using (user_id = auth.uid());
create policy "own quiz"      on public.quiz_answers  for select to authenticated using (user_id = auth.uid());
create policy "own elements"  on public.user_elements for select to authenticated using (user_id = auth.uid());
create policy "own prompts"   on public.user_prompts  for select to authenticated using (user_id = auth.uid());
create policy "own batches"   on public.batches       for select to authenticated using (user_id = auth.uid());
create policy "own items"     on public.batch_items   for select to authenticated using (user_id = auth.uid());
create policy "own payments"  on public.payments      for select to authenticated using (user_id = auth.uid());
create policy "own feedback"  on public.date_feedback for select to authenticated using (user_id = auth.uid());
create policy "own blocks"    on public.blocks        for select to authenticated using (blocker_id = auth.uid());

-- Bond members, and never across a block.
create policy "bond members" on public.bonds for select to authenticated
  using (auth.uid() in (user_a, user_b) and not public.is_blocked_pair(user_a, user_b));

create policy "bond messages" on public.messages for select to authenticated
  using (public.is_bond_member(bond_id));

create policy "bond dates" on public.date_plans for select to authenticated
  using (public.is_bond_member(bond_id));

-- Reciprocity rule: you see your own answers, and your partner's answers for a round
-- only once BOTH of you have submitted that round.
create policy "round responses after both submit" on public.round_responses for select to authenticated
  using (
    user_id = auth.uid()
    or (submitted_at is not null and public.i_submitted_round(bond_id, round))
  );

-- Venues are public reference data.
create policy "venues readable" on public.venues for select to anon, authenticated using (true);

-- reports, waitlist, events, rate_limits: no client policies at all (service role only).

-- ================================================================ realtime
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.bonds;
alter publication supabase_realtime add table public.date_plans;

-- ================================================================ storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 6291456, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
-- No storage policies: the bucket is private and only the server (service role) reads/writes it.
-- Images reach browsers only through /api/photos/[id], which checks blur entitlement first.
