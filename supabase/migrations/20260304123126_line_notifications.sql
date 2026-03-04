create table line_notifications (
  id                   bigint primary key generated always as identity not null,
  created_at           timestamptz default now() not null,
  updated_at           timestamptz default now() not null,
  scheduled_at         timestamptz,
  send_at              timestamptz,
  line_user_id         text not null,
  message              text not null,
  status               text not null default 'pending',
  optometry_report_id  uuid references optometry_reports(id) on delete set null,

  constraint line_notifications_status_check
    check (status in ('pending', 'sent', 'failed', 'cancelled'))
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger line_notifications_updated_at
  before update on line_notifications
  for each row execute procedure set_updated_at();

alter table line_notifications enable row level security;

create policy "authenticated users full access" on line_notifications
  for all
  to authenticated
  using (true)
  with check (true);
