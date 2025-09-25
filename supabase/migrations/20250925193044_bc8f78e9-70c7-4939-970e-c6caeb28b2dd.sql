-- Drop trigger first, then function, then recreate both with proper security
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Recreate function with proper search_path
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer 
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

-- Recreate trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Fix update function search path
create or replace function public.update_updated_at_column()
returns trigger 
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;