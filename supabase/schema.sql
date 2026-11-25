-- Run once in Supabase: SQL Editor > New query > paste > Run.
create table if not exists entries (
  store text not null, id text not null, data jsonb not null,
  created_at timestamptz not null default now(),
  primary key (store, id)
);
alter table entries enable row level security;
create policy "open read"   on entries for select to anon using (true);
create policy "open insert" on entries for insert to anon with check (true);
create policy "open update" on entries for update to anon using (true) with check (true);
create policy "open delete" on entries for delete to anon using (true);
alter publication supabase_realtime add table entries;

insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict do nothing;
create policy "open read media"   on storage.objects for select to anon using (bucket_id = 'media');
create policy "open upload media" on storage.objects for insert to anon with check (bucket_id = 'media');
create policy "open update media" on storage.objects for update to anon using (bucket_id = 'media');
create policy "open delete media" on storage.objects for delete to anon using (bucket_id = 'media');
