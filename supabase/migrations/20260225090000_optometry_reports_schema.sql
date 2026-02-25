create table
  optometry_reports (
    id uuid primary key default gen_random_uuid(),
    member_id bigint not null references members (id) on delete cascade,

    -- 右眼 (Right Eye / OD)
    od_sphere decimal(4, 2),
    od_cylinder decimal(4, 2),
    od_axis integer,
    od_va text,

    -- 左眼 (Left Eye / OS)
    os_sphere decimal(4, 2),
    os_cylinder decimal(4, 2),
    os_axis integer,
    os_va text,

    pd decimal(4, 1),
    add_power decimal(4, 2),

    is_final_prescription boolean default false,
    remarks text,
    created_at timestamptz default now()
  );

-- RLS
alter table optometry_reports enable row level security;

create policy "Admin full access on optometry_reports"
  on optometry_reports
  for all
  using (true)
  with check (true);
