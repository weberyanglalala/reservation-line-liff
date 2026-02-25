-- LINE LIFF 使用者（anon role）可讀取預約紀錄
-- 與 anon insert policy 一致：LINE users 使用 anon key，無 Supabase auth session
create policy "anon users can read bookings" on bookings
  for select
  to anon
  using (true);
