# LINE 通知功能規劃

## 概覽

在現有後台會員管理頁面（`/admin/members`）中，新增 LINE 通知功能。
當驗光報告標記為「最終處方（`is_final_prescription = true`）」時，管理員可點擊按鈕產生一筆 LINE 通知記錄，系統排程後發送給對應的 LINE 用戶。

---

## 資料庫 Schema

### 新增 Table：`line_notifications`

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_line_notifications.sql
create table line_notifications (
  id                   bigint primary key generated always as identity not null,
  created_at           timestamptz default now() not null,
  updated_at           timestamptz default now() not null,
  scheduled_at         timestamptz,
  send_at              timestamptz,
  line_user_id         text not null,
  message              text not null,
  status               text not null default 'pending',
  optometry_report_id  bigint references optometry_reports(id) on delete set null,

  constraint line_notifications_status_check
    check (status in ('pending', 'sent', 'failed', 'cancelled'))
);
```

**欄位說明：**

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | bigint | 主鍵，自動遞增 |
| `created_at` | timestamptz | 建立時間 |
| `updated_at` | timestamptz | 最後更新時間（需 trigger 或手動更新） |
| `scheduled_at` | timestamptz | 預計發送時間（nullable，留空代表立即發送） |
| `send_at` | timestamptz | 實際發送時間（nullable，發送後寫入） |
| `line_user_id` | text | LINE 用戶 ID（對應 members.line_id） |
| `message` | text | 通知訊息內容 |
| `status` | text | `pending` / `sent` / `failed` / `cancelled` |
| `optometry_report_id` | bigint | 關聯的驗光報告 ID（FK，nullable） |

### `updated_at` 自動更新 Trigger

```sql
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
```

### RLS 政策

```sql
alter table line_notifications enable row level security;

-- 管理員（authenticated）完整存取
create policy "authenticated users full access" on line_notifications
  for all
  to authenticated
  using (true)
  with check (true);
```

---

## UI 異動：`src/pages/admin/members.vue`

### 現況

展開驗光報告列表時，每筆報告列最後有「編輯（Pencil）」按鈕。

### 目標

在 `is_final_prescription === true` 的報告列中，「編輯」按鈕旁新增一個「發送 LINE 通知」按鈕（Bell icon）。

**視覺草圖（報告列操作欄）：**

```
[ 建立時間 | OD ... | OS ... | PD | ADD | 最終 | 備註 | ✏️ | 🔔 ]
                                                              ↑
                                              is_final_prescription = true 才顯示
```

點擊 🔔 按鈕後開啟一個 **Dialog**，讓管理員：
1. 預覽預帶入的訊息內容（可編輯）
2. 選填排程時間 `scheduled_at`（留空代表立即）
3. 確認送出 → insert 一筆 `line_notifications` 記錄

### Dialog 欄位

| 欄位 | UI 元件 | 說明 |
|------|---------|------|
| `line_user_id` | 唯讀顯示 | 自動帶入 member.line_id |
| `message` | Textarea（可編輯） | 預帶入預設訊息模板 |
| `scheduled_at` | DateTime Input（選填） | 留空 = 立即（status = pending，由外部排程處理） |

**預設訊息模板範例：**

```
親愛的 {display_name} 您好，
您的驗光報告（最終處方）已完成，請至門市取件或洽詢相關事宜。
感謝您的光臨！
```

---

## 新增狀態與函式（`members.vue` script）

```typescript
// --- LINE 通知 Dialog ---
const notifyDialogOpen = ref(false)
const notifyReport = ref<OptometryReport | null>(null)
const notifyMember = ref<Member | null>(null)
const notifyForm = ref({ message: '', scheduled_at: '' })
const isNotifySubmitting = ref(false)
const notifySubmitError = ref('')

function openNotifyDialog(report: OptometryReport, member: Member) { ... }
async function submitNotification() { ... }
```

---

## 執行 Phase 計劃

---

### Phase 1：資料庫 Migration

- [ ] 1.1 建立 `line_notifications` table migration
  - 產生檔案：`supabase/migrations/YYYYMMDDHHMMSS_line_notifications.sql`
- [ ] 1.2 加入 `updated_at` 自動更新 trigger
- [ ] 1.3 加入 RLS 政策（authenticated 完整存取）
- [ ] 1.4 套用 migration 至遠端 DB：`npm run db:migrate:up`
- [ ] 1.5 重新產生 TypeScript 型別：`npm run supabase:types`

---

### Phase 2：UI — 按鈕顯示

- [ ] 2.1 在 `members.vue` 驗光報告列的操作欄，對 `is_final_prescription === true` 的列加入 Bell 按鈕
  - 使用 `lucide-vue-next` 的 `Bell` icon
  - 緊接在 Pencil 編輯按鈕右側

---

### Phase 3：發送通知 Dialog

- [ ] 3.1 新增 `notifyDialogOpen`、`notifyReport`、`notifyMember`、`notifyForm` 等 ref
- [ ] 3.2 實作 `openNotifyDialog(report, member)`
  - 帶入預設訊息模板（含 `display_name`）
  - 清空 `scheduled_at`
- [ ] 3.3 實作 `submitNotification()`
  - insert 至 `line_notifications` table
  - 欄位：`line_user_id`、`message`、`scheduled_at`（可 null）、`optometry_report_id`、`status = 'pending'`
  - 成功後關閉 Dialog 並顯示成功提示
- [ ] 3.4 建立 Dialog template
  - 顯示目標 LINE 用戶（唯讀）
  - 可編輯訊息 Textarea
  - 選填 `scheduled_at` datetime-local input
  - 取消 / 送出按鈕

---

## 關鍵技術細節

### `line_user_id` 來源
`member.line_id` 即為 LINE userId，直接作為 `line_user_id` 寫入通知記錄。

### `status` 流程
本次僅負責「建立通知記錄」（status = `pending`）。
實際發送由外部後端自行讀取 `pending` 記錄並處理，發送後由外部後端更新 `status` 與 `send_at`。前台不涉及發送邏輯。

### 不重複通知（可選討論）
是否需要防止同一筆 `optometry_report_id` 重複建立通知？可在 DB 加 unique constraint 或前端加提示。
**本次規劃暫不加限制**，由管理員自行判斷。

---

## 檔案清單（新增 / 修改）

| 狀態 | 檔案 | 說明 |
|------|------|------|
| 新增 | `supabase/migrations/YYYYMMDDHHMMSS_line_notifications.sql` | table + trigger + RLS |
| 修改 | `database/types.ts` | 重新產生（含 `line_notifications`） |
| 修改 | `src/pages/admin/members.vue` | 新增 Bell 按鈕 + 通知 Dialog |
