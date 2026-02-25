-- LINE LIFF 使用者（anon role）可新增預約
-- LINE users are not Supabase auth users, so they use the anon key without a session
create policy "anon users can insert bookings" on bookings
  for insert
  to anon
  with check (true);
