-- 1) Enable required extensions
create extension if not exists "uuid-ossp";

-- 2) profiles table
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  role text check (role in ('user','admin')) default 'user',
  default_target_lang text default 'en',
  tz text default 'America/Vancouver',
  created_at timestamptz default now()
);

-- 3) stripe_customers table
create table public.stripe_customers (
  user_id uuid primary key references auth.users on delete cascade,
  customer_id text unique not null,
  created_at timestamptz default now()
);

-- 4) subscriptions table
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  price_id text not null,
  status text check (status in ('trialing','active','past_due','canceled','incomplete')) not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now()
);

-- 5) recordings table
create table public.recordings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  source text check (source in ('mic','upload')) not null,
  storage_path text,
  original_filename text,
  mime_type text,
  duration_sec integer,
  size_bytes bigint,
  deepgram_request_id text,
  status text check (status in ('queued','processing','completed','failed')) default 'queued',
  error_message text,
  created_at timestamptz default now()
);

-- 6) transcripts table
create table public.transcripts (
  id uuid primary key default gen_random_uuid(),
  recording_id uuid references public.recordings on delete cascade,
  language_detected text,
  confidence numeric,
  text text,
  words jsonb,
  segments jsonb,
  created_at timestamptz default now()
);

-- 7) translations table
create table public.translations (
  id uuid primary key default gen_random_uuid(),
  transcript_id uuid references public.transcripts on delete cascade,
  target_lang text not null,
  model text not null,
  text text not null,
  created_at timestamptz default now()
);

-- 8) usage_counters table
create table public.usage_counters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  stt_seconds_used integer default 0,
  translate_chars_used bigint default 0,
  created_at timestamptz default now()
);

-- 9) audit_log table
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  action text,
  target_id uuid,
  meta jsonb,
  created_at timestamptz default now()
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.stripe_customers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.recordings enable row level security;
alter table public.transcripts enable row level security;
alter table public.translations enable row level security;
alter table public.usage_counters enable row level security;
alter table public.audit_log enable row level security;

-- RLS Policies for profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- RLS Policies for stripe_customers
create policy "Users can view own stripe data" on public.stripe_customers
  for select using (auth.uid() = user_id);

create policy "Users can insert own stripe data" on public.stripe_customers
  for insert with check (auth.uid() = user_id);

-- RLS Policies for subscriptions
create policy "Users can view own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "Users can insert own subscriptions" on public.subscriptions
  for insert with check (auth.uid() = user_id);

-- RLS Policies for recordings
create policy "Users can view own recordings" on public.recordings
  for select using (auth.uid() = user_id);

create policy "Users can insert own recordings" on public.recordings
  for insert with check (auth.uid() = user_id);

create policy "Users can update own recordings" on public.recordings
  for update using (auth.uid() = user_id);

create policy "Users can delete own recordings" on public.recordings
  for delete using (auth.uid() = user_id);

-- RLS Policies for transcripts
create policy "Users can view own transcripts" on public.transcripts
  for select using (auth.uid() = (select user_id from recordings where id = recording_id));

create policy "Users can insert own transcripts" on public.transcripts
  for insert with check (auth.uid() = (select user_id from recordings where id = recording_id));

-- RLS Policies for translations
create policy "Users can view own translations" on public.translations
  for select using (auth.uid() = (select r.user_id from recordings r 
    join transcripts t on r.id = t.recording_id 
    where t.id = transcript_id));

create policy "Users can insert own translations" on public.translations
  for insert with check (auth.uid() = (select r.user_id from recordings r 
    join transcripts t on r.id = t.recording_id 
    where t.id = transcript_id));

-- RLS Policies for usage_counters
create policy "Users can view own usage" on public.usage_counters
  for select using (auth.uid() = user_id);

create policy "Users can insert own usage" on public.usage_counters
  for insert with check (auth.uid() = user_id);

create policy "Users can update own usage" on public.usage_counters
  for update using (auth.uid() = user_id);

-- RLS Policies for audit_log
create policy "Users can view own audit logs" on public.audit_log
  for select using (auth.uid() = user_id);

create policy "Users can insert own audit logs" on public.audit_log
  for insert with check (auth.uid() = user_id);

-- Create storage buckets
insert into storage.buckets (id, name, public) values ('audio-uploads', 'audio-uploads', false);
insert into storage.buckets (id, name, public) values ('exports', 'exports', false);

-- Storage policies for audio-uploads bucket
create policy "Users can upload their own audio files"
  on storage.objects for insert
  with check (bucket_id = 'audio-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view their own audio files"
  on storage.objects for select
  using (bucket_id = 'audio-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own audio files"
  on storage.objects for delete
  using (bucket_id = 'audio-uploads' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for exports bucket
create policy "Users can upload their own exports"
  on storage.objects for insert
  with check (bucket_id = 'exports' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view their own exports"
  on storage.objects for select
  using (bucket_id = 'exports' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own exports"
  on storage.objects for delete
  using (bucket_id = 'exports' and auth.uid()::text = (storage.foldername(name))[1]);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;