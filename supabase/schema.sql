create table if not exists public.study_tracks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id text not null,
  label text not null,
  type text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists study_tracks_user_client_id_key
on public.study_tracks(user_id, client_id);

alter table public.study_tracks enable row level security;

create policy "Usuários leem apenas suas áreas"
on public.study_tracks for select to authenticated
using (auth.uid() = user_id);

create policy "Usuários criam apenas suas áreas"
on public.study_tracks for insert to authenticated
with check (auth.uid() = user_id);

create policy "Usuários atualizam apenas suas áreas"
on public.study_tracks for update to authenticated
using (auth.uid() = user_id);

create policy "Usuários removem apenas suas áreas"
on public.study_tracks for delete to authenticated
using (auth.uid() = user_id);
