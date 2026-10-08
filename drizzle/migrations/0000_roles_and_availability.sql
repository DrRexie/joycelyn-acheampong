create type public.app_role as enum ('admin', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

-- First account to sign up becomes the site admin
create or replace function public.grant_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_first_admin after insert on auth.users
for each row execute function public.grant_first_admin();

create table public.availability_settings (
  id int primary key default 1 check (id = 1),
  time_zone text not null default 'America/New_York',
  weekly jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select on public.availability_settings to anon, authenticated;
grant update on public.availability_settings to authenticated;
grant all on public.availability_settings to service_role;
alter table public.availability_settings enable row level security;
create policy "Anyone can read availability" on public.availability_settings for select to anon, authenticated using (true);
create policy "Admins update availability" on public.availability_settings for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

insert into public.availability_settings (id, time_zone, weekly) values (1, 'America/New_York',
 '{"0":[],"1":["10:00","11:30","13:00","14:30","16:00","17:30"],"2":["10:00","11:30","13:00","14:30","16:00","17:30"],"3":["10:00","11:30","13:00","14:30","16:00","17:30"],"4":["10:00","11:30","13:00","14:30","16:00","17:30"],"5":["10:00","11:30","13:00","14:30","16:00","17:30"],"6":[]}'::jsonb);