alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create index if not exists profiles_is_admin_idx
  on public.profiles (is_admin)
  where is_admin = true;

comment on column public.profiles.is_admin is
  'Controls access to the AuraBeat admin dashboard and internal admin API routes.';
