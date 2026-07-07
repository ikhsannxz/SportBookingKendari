-- ============================================================
-- SportBook: Migration 005 — Auth Triggers
-- ============================================================
-- Purpose: Creates the auth.users triggers which require
--          public.profiles to exist.
-- ============================================================

-- Auto-create a profile row when a new auth.user is inserted
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$;

-- Wire auto-profile creation on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
