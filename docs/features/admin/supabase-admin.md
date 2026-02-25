# Admin 後台系統規劃：Supabase Email Auth

## 概覽

在現有 LINE LIFF 專案中，於同一個 Vue 3 + Supabase 專案內，新增以 Supabase Email Auth 驅動的後台管理系統。

- 前台（LIFF 用戶）：`/`、`/register`、`/profile`、`/booking` — 維持 LINE OAuth 認證
- 後台（管理員）：`/admin/*` — 使用 Supabase Email + Password 認證

---

## 架構設計

### 路由結構

```
src/pages/
├── index.vue               → / (LIFF 首頁)
├── register.vue            → /register
├── profile.vue             → /profile
├── booking.vue             → /booking (新增：用戶預約)
├── [...catchAll].vue       → 404
└── admin/
    ├── login.vue           → /admin/login (管理員登入)
    ├── index.vue           → /admin (redirect → /admin/bookings)
    └── bookings.vue        → /admin/bookings (預約確認頁)
```

### Layout 切換策略

`App.vue` 改用 `useRoute` + route meta (`layout`) 動態切換 Layout：

```
meta.layout = 'liff'   → <LiffLayout>
meta.layout = 'admin'  → <AdminLayout>
meta.layout = 'blank'  → 直接渲染（admin login 頁）
```

由於 `unplugin-vue-router` 支援 `definePage()` macro，每個 page 可宣告自己的 meta。

### 認證分流

```
瀏覽 /admin/*
  ├── adminAuthStore.isAuthenticated?
  │     ├── YES → 進入頁面
  │     └── NO  → redirect /admin/login
  │
瀏覽 /* (非 admin)
  └── authStore.initLiff() (現有 LINE LIFF 流程，不變)
```

### 狀態管理

| Store | 用途 |
|-------|------|
| `src/stores/auth.ts`（現有）| LINE LIFF 認證、member 資料 |
| `src/stores/adminAuth.ts`（新增）| Supabase Email Auth session |

---

## 資料庫 Schema

### 新增 Table：`bookings`

```sql
-- supabase/migrations/20260225074528_bookings_schema.sql
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
```

### RLS 政策

```sql
alter table bookings enable row level security;

-- 管理員（已登入的 auth.users）可完整存取所有預約
create policy "authenticated users full access" on bookings
  for all
  to authenticated
  using (true)
  with check (true);
```

> 注意：目前前台 LIFF 使用 `anon` key 操作 Supabase。管理員登入後使用 `authenticated` session，因此 RLS 可依 `to authenticated` 區分。LIFF 前台的預約 insert 需使用 `service_role`，或後續視需求擴充 RLS policy。

### 管理員帳號建立

不建立額外 `admins` table，直接使用 Supabase Auth 內建 `auth.users`。
初始管理員帳號透過 Supabase Dashboard 或 seed script 建立。

```js
// database/seed.js（新增管理員建立段落）
const { data, error } = await supabase.auth.admin.createUser({
  email: 'admin@example.com',
  password: 'your-secure-password',
  email_confirm: true,
})
```

---

## 元件結構

### `AdminLayout.vue`

```
src/components/Layout/AdminLayout.vue
├── 頂部 Navbar（Logo、登出按鈕、管理員 email）
├── 側邊 Sidebar（選單：預約管理）
└── <slot />（主內容區）
```

---

## 執行 Phase 計劃

---

### Phase 1：資料庫 Migration ✅

- [x] 1.1 建立 bookings table migration
  - 產生檔案：`supabase/migrations/20260225074528_bookings_schema.sql`
- [x] 1.2 加入 RLS 政策至同一 migration 檔案
  - `status` 加入 CHECK constraint：`('pending', 'confirmed', 'cancelled')`
  - Policy：`authenticated` role 完整存取
- [x] 1.3 套用 migration 至遠端 DB
  - `Applying migration 20260225074528_bookings_schema.sql... ✓`
- [x] 1.4 重新產生 TypeScript 型別
  - `database/types.ts` 已更新，`Tables<'bookings'>` 可用

---

### Phase 2：安裝相依套件

- [x] 2.1 安裝表單驗證套件
  ```bash
  npm install vee-validate @vee-validate/zod zod
  ```
- [x] 2.2 確認 `shadcn-vue` 已有需要的 UI 元件，若無則新增
  ```bash
  # 如需要 Form、Label、Alert 元件
  npx shadcn-vue@latest add form label alert badge
  ```

---

### Phase 3：AdminAuth Store

新增 `src/stores/adminAuth.ts`：

- [x] 3.1 定義 state：`session`、`user`、`isLoading`
- [x] 3.2 實作 `init()`：呼叫 `supabase.auth.getSession()`，並訂閱 `onAuthStateChange`
- [x] 3.3 實作 `signIn(email, password)`：呼叫 `supabase.auth.signInWithPassword()`
- [x] 3.4 實作 `signOut()`：呼叫 `supabase.auth.signOut()`
- [x] 3.5 computed：`isAuthenticated`（`!!session`）、`adminEmail`

```typescript
// src/stores/adminAuth.ts 骨架
export const useAdminAuthStore = defineStore('adminAuth', () => {
  const session = ref<Session | null>(null)
  const isLoading = ref(true)

  const isAuthenticated = computed(() => !!session.value)
  const adminEmail = computed(() => session.value?.user?.email ?? '')

  async function init() { /* getSession + onAuthStateChange */ }
  async function signIn(email: string, password: string) { /* ... */ }
  async function signOut() { /* ... */ }

  return { session, isLoading, isAuthenticated, adminEmail, init, signIn, signOut }
})
```

---

### Phase 4：Router Guard

修改 `src/router/index.ts`：

- [x] 4.1 在 `router.beforeEach` 中加入 admin 路由守衛
  - `/admin/login`：若已登入則 redirect `/admin/bookings`
  - `/admin/*`（非 login）：若未登入則 redirect `/admin/login`
- [x] 4.2 確保 LIFF 路由不受 admin guard 影響

```typescript
// src/router/index.ts 新增片段
import { useAdminAuthStore } from '@/stores/adminAuth'

router.beforeEach(async (to) => {
  if (!to.path.startsWith('/admin')) return true

  const adminAuth = useAdminAuthStore()
  if (adminAuth.isLoading) await adminAuth.init()

  if (to.path === '/admin/login') {
    return adminAuth.isAuthenticated ? '/admin/bookings' : true
  }

  if (!adminAuth.isAuthenticated) {
    return '/admin/login'
  }
})
```

---

### Phase 5：Layout 切換

- [x] 5.1 建立 `src/components/Layout/AdminLayout.vue`
  - Navbar：顯示系統名稱、管理員 email、登出按鈕
  - Sidebar：`預約管理` 連結
  - 主內容 `<slot />`
- [x] 5.2 修改 `src/App.vue` 支援動態 layout

```vue
<!-- src/App.vue -->
<script setup lang="ts">
const route = useRoute()
const layout = computed(() => {
  const meta = route.meta as { layout?: string }
  return meta.layout ?? 'liff'
})
</script>

<template>
  <AdminLayout v-if="layout === 'admin'">
    <RouterView />
  </AdminLayout>
  <LiffLayout v-else>
    <RouterView />
  </LiffLayout>
</template>
```

- [x] 5.3 各 admin page 使用 `definePage` macro 宣告 meta

```vue
<!-- src/pages/admin/bookings.vue -->
<script setup lang="ts">
definePage({ meta: { layout: 'admin' } })
</script>
```

```vue
<!-- src/pages/admin/login.vue -->
<script setup lang="ts">
definePage({ meta: { layout: 'blank' } })
</script>
```

---

### Phase 6：Admin 登入頁 `/admin/login`

- [x] 6.1 建立 `src/pages/admin/login.vue`
- [x] 6.2 使用 **VeeValidate + Zod** 建立登入表單驗證 schema

```typescript
// 驗證 schema
const loginSchema = toTypedSchema(
  z.object({
    email: z.string().email('請輸入有效的 Email'),
    password: z.string().min(8, '密碼至少 8 個字元'),
  })
)
```

- [x] 6.3 使用 `useForm` + `<Field>` 或 shadcn `<FormField>` 渲染表單
- [x] 6.4 呼叫 `adminAuthStore.signIn(email, password)` 並處理錯誤
  - 錯誤訊息顯示：`Invalid login credentials` → 顯示「帳號或密碼錯誤」
- [x] 6.5 登入成功後 `router.push('/admin/bookings')`

---

### Phase 7：Admin 預約確認頁 `/admin/bookings`

- [x] 7.1 建立 `src/pages/admin/index.vue`（redirect 至 `/admin/bookings`）

```vue
<script setup lang="ts">
definePage({ meta: { layout: 'admin' } })
const router = useRouter()
onMounted(() => router.replace('/admin/bookings'))
</script>
```

- [x] 7.2 建立 `src/pages/admin/bookings.vue`

  **功能清單：**
  - [x] 7.2.1 從 Supabase 撈取所有 bookings（join members 取得姓名）
  - [x] 7.2.2 使用 `shadcn DataTable` + TanStack Table 顯示列表
  - [x] 7.2.3 表格欄位：預約日期、時間、會員名稱、服務項目、狀態、備註、操作
  - [x] 7.2.4 狀態 Badge：`pending` 黃色、`confirmed` 綠色、`cancelled` 紅色
  - [x] 7.2.5 「確認」按鈕：更新 `status = 'confirmed'`、寫入 `confirmed_at`、`confirmed_by`
  - [x] 7.2.6 「取消」按鈕：更新 `status = 'cancelled'`
  - [x] 7.2.7 篩選器：依狀態篩選（全部 / 待確認 / 已確認 / 已取消）

---

### Phase 8：LIFF 前台預約功能 `/booking`

- [x] 8.1 建立 `src/pages/booking.vue`
- [x] 8.2 使用 **VeeValidate + Zod** 建立預約表單驗證 schema

```typescript
const bookingSchema = toTypedSchema(
  z.object({
    service: z.string().min(1, '請選擇服務項目'),
    booking_date: z.string().min(1, '請選擇預約日期'),
    booking_time: z.string().min(1, '請選擇預約時間'),
    notes: z.string().max(200, '備註不得超過 200 字').optional(),
  })
)
```

- [x] 8.3 Guard：未登入或未註冊則 redirect 首頁
- [x] 8.4 呼叫 Supabase insert 至 bookings，`member_id` 來自 `authStore.member.id`
- [x] 8.5 提交成功後顯示確認訊息（不跳頁，inline 顯示）

---

## 關鍵技術細節

### LIFF SDK 初始化不得影響 admin 路由

`authStore.initLiff()` 目前在 `index.vue` 的 `onMounted` 中呼叫，不在 root `App.vue`，因此 admin 路由不會觸發 LIFF init。確認並維持此模式。

### Supabase Auth Session 持久化

`createClient` 預設會將 session 存至 `localStorage`，重整頁面後 `getSession()` 可還原 session，無需額外處理。

### VeeValidate 與 shadcn Form 整合

shadcn-vue 的 `<Form>` 元件已基於 VeeValidate 封裝，建議使用 `<FormField>` + `<FormItem>` + `<FormMessage>` 組合，搭配 `toTypedSchema(zodSchema)` 使用。

### 型別安全

- `database/types.ts` 重新產生後，`Tables<'bookings'>` 可直接使用
- `adminAuth.ts` 使用 `import type { Session, User } from '@supabase/supabase-js'`

---

## 檔案清單（新增 / 修改）

| 狀態 | 檔案 | 說明 |
|------|------|------|
| ✅ 已完成 | `supabase/migrations/20260225074528_bookings_schema.sql` | bookings table + RLS |
| 新增 | `src/stores/adminAuth.ts` | 管理員 auth store |
| 新增 | `src/components/Layout/AdminLayout.vue` | 後台 layout |
| 修改 | `src/App.vue` | 動態 layout 切換 |
| 修改 | `src/router/index.ts` | admin navigation guard |
| 新增 | `src/pages/admin/login.vue` | 管理員登入頁 |
| 新增 | `src/pages/admin/index.vue` | admin root redirect |
| 新增 | `src/pages/admin/bookings.vue` | 預約確認管理頁 |
| 新增 | `src/pages/booking.vue` | LIFF 用戶預約頁 |
