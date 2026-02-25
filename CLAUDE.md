# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

這是一個 **LINE LIFF（LINE Front-end Framework）應用程式**，使用 Vue 3 + TypeScript + Supabase 建構。應用程式負責處理 LINE 登入驗證與會員註冊/個人資料管理。

### 核心使用者流程
1. 使用者開啟 LINE LIFF → 必須完成 LINE 登入
2. 若使用者已註冊 → 顯示會員基本資料頁面
3. 若使用者未註冊 → 透過 LINE ID + Profile 資料進行註冊，資料存至 Supabase

## 常用指令

```bash
npm run dev           # 啟動開發伺服器
npm run build         # 型別檢查 + 建置正式版本
npm run type-check    # 僅執行 vue-tsc 型別檢查
npm run lint          # 執行 oxlint + eslint（含 --fix）
npm run format        # 對 src/ 執行 prettier 排版

# Supabase
npm run supabase:login           # 登入 Supabase CLI
npm run supabase:link            # 連結遠端專案（讀取 .env 中的 SUPABASE_PROJECT_ID）
npm run supabase:types           # 從遠端 DB schema 產生 TypeScript 型別
npm run db:migrate:new           # 在 supabase/migrations/ 建立新的時間戳記遷移檔
npm run db:reset                 # 危險：重置並重新套用所有遷移至連結的遠端 DB
npm run db:seed                  # 執行 database/seed.js 填充測試資料
npm run db:migrate:up            # 將待處理的遷移套用至連結的遠端 DB
```

## 架構說明

### 檔案型路由（`unplugin-vue-router`）
頁面放置於 `src/pages/`。路由在建置時自動產生，不需手動維護 `routes` 陣列。產生的型別定義存放於 `typed-router.d.ts`。

- `src/pages/index.vue` → `/`
- `src/pages/[...catchAll].vue` → 404 捕捉所有未定義路由
- `src/pages/foo/[id].vue` → `/foo/:id`

`src/router/index.ts` 非常精簡，僅使用 `vue-router/auto-routes` 提供的自動產生路由建立 router 實例。

### 自動匯入（Auto-imports）
- **Vue 與 Vue Router API**（`ref`、`computed`、`useRoute` 等）已自動匯入，`.vue` 檔案中不需明確寫 `import`。
- **`src/components/` 中的元件**透過 `unplugin-vue-components` 自動匯入。
- 型別宣告自動產生至 `auto-imports.d.ts` 與 `components.d.ts`。

### Supabase 客戶端
- 單一客戶端實例：`src/lib/supabaseClient.ts`
- TypeScript 型別定義：`database/types.ts`（執行 `npm run supabase:types` 重新產生）
- `.env` 必填環境變數：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`、`SUPABASE_PROJECT_ID`、`SERVICE_ROLE_KEY`

### UI 技術棧
- **Shadcn Vue**（樣式：`new-york`，基底色：`slate`）— 元件放置於 `src/components/ui/`，透過 `npx shadcn-vue@latest add <元件名>` 新增
- **Tailwind CSS v4** 透過 `@tailwindcss/vite` 插件整合
- **Iconify** Web Component 圖示（已在 `vite.config.ts` 中註冊為自訂元素，元素名稱以 `iconify-icon` 開頭）
- **TanStack Table** 用於複雜資料表格

### 狀態管理
使用 Pinia 進行全域狀態管理。Store 檔案應放置於 `src/stores/`。

### 應用程式入口
`App.vue` 將 `<RouterView>` 包覆於 `<AuthLayout>` 中，並使用 `<Suspense>` 處理頁面 setup function 中的非同步操作。

## 資料庫開發流程

1. 建立遷移：`npm run db:migrate:new` → 編輯 `supabase/migrations/` 中產生的 SQL 檔案
2. 套用至遠端：`npm run db:migrate:up`
3. 重新產生型別：`npm run supabase:types`

`database/types.ts` 是 TypeScript DB 型別的唯一來源，每次 schema 變更後務必重新產生。

## LINE LIFF 整合

新增 LIFF SDK 時：
- 安裝 `@line/liff`
- 在 composable 或 store 中初始化 LIFF，並在進入受保護路由前完成
- LINE 登入後，將 LINE Profile 資料（`userId`、`displayName`、`pictureUrl`）存入 Pinia
- `lineId`（即 LINE `userId`）作為連結 LINE 身份與 Supabase `members` 資料表的主要識別鍵

## 開發慣例

- 所有元件一律使用 `<script setup lang="ts">`
- `@` 別名對應 `src/`
- Lint 執行順序：先 oxlint，再 eslint（皆含自動修正）
