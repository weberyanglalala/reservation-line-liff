-- bookings table
create table bookings (
  id             bigint primary key generated always as identity not null,
  created_at     timestamptz default now() not null,
  member_id      bigint not null references members(id) on delete cascade,
  service        text not null,
  booking_date   date not null,
  booking_time   time not null,
  status         text not null default 'pending',
  notes          text,
  confirmed_at   timestamptz,
  confirmed_by   uuid references auth.users(id),

  constraint bookings_status_check check (status in ('pending', 'confirmed', 'cancelled'))
);

-- RLS
alter table bookings enable row level security;

-- 管理員（已登入的 auth.users）可完整存取所有預約
create policy "authenticated users full access" on bookings
  for all
  to authenticated
  using (true)
  with check (true);
