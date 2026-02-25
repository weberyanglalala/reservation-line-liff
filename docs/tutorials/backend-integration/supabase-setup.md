---
description: 學習如何初始化 Supabase 後端專案，並整合至 Vue.js 前端應用。
---

# 啟動應用程式後端：Supabase 初始化與整合 🚀

歡迎來到 **後端開發** 篇章！在本單元中，我們將學習如何使用 [Supabase](https://supabase.com/) 來為我們的 Vue.js 應用程式快速搭建強大的後端基礎設施。Supabase 是一個開放原始碼的 Firebase 替代品，提供了資料庫、身分驗證、即時訂閱等即用功能，讓我們能專注於打造優質的使用者體驗！✨

## 為什麼選擇 Supabase？ 🤔

- **PostgreSQL**: 強大的關聯式資料庫，支援 SQL 查詢。
- **Realtime**: 即時資料更新，讓應用程式無需重新整理即可獲取最新資訊。
- **Authentication**: 整合 Google, GitHub 等第三方登入，以及 Email 註冊流程。
- **Storage**: 輕鬆管理使用者上傳的檔案與圖片。

## 🛠️ 第一步：安裝 Supabase 客戶端套件

首先，我們需要在專案中安裝 `supabase-js` 客戶端程式庫，這將是我們與 Supabase 溝通的橋樑。

請在終端機執行以下指令：

```bash
npm install @supabase/supabase-js
```

### 檢視 `package.json`

安裝完成後，我們可以檢查 `package.json` 確認依賴是否正確加入：

```json
// package.json (部分內容)
{
  "dependencies": {
    "@supabase/supabase-js": "^2.96.0",
    "pinia": "^3.0.4",
    "vue": "^3.5.28",
    "vue-router": "^4.6.4"
  }
}
```

## 🔐 第二步：設定環境變數

為了安全地連線到我們的 Supabase 專案，我們需要設定專案 URL 與匿名金鑰 (Anon Key)。由於這些是敏感資訊或每個開發環境可能不同，最佳實務是將它們放在環境變數檔案中。

### 1. 建立 `.env` 檔案

在專案根目錄建立或編輯 `.env` 檔案，填入以下內容（請替換為你的 Supabase 專案資訊）：

```properties
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. 更新 `.env.example`

同時，我們也應該更新 `.env.example` 讓團隊成員知道需要哪些環境變數：

```properties
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

> **💡 小提醒**：以 `VITE_` 開頭的環境變數才會被 Vite 暴露給前端程式碼使用，這是 Vite 的安全機制。

## 🔌 第三步：建立 Supabase 客戶端實例

接下來，我們需要建立一個統一的 Supabase 客戶端實例，供整個應用程式重複使用。我們將這個設定檔放在 `src/lib/supabaseClient.ts` 中。

### 建立 `src/lib/supabaseClient.ts`

```typescript
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// 使用 import.meta.env 读取环境变量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 建立并导出单一的 supabase 客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

這樣一來，我們就完成初始化設定囉！🎉

## 💪 第四步：動手做做看 - 在 App.vue 中測試連線

現在，讓我們來驗證一下是否可以成功引入 `supabase` 客戶端。

請打開 `src/App.vue` 並嘗試引入它：

```vue
<script setup lang="ts">
import { supabase } from '@/lib/supabaseClient'

// 在控制台輸出 supabase 實例，確認初始化成功
console.log(supabase)
</script>

<template>
  <main>
    <RouterView />
  </main>
</template>
```

打開瀏覽器的開發者工具 (F12) -> Console，如果看到 Supabase 的客戶端物件被印出來，那就表示我們成功連線到後端了！🎊

## 📝 總結

在本單元中，我們完成了：

1.  安裝了 `@supabase/supabase-js` 套件。
2.  設定了 `.env` 環境變數。
3.  建立了 `src/lib/supabaseClient.ts` 作為統一的客戶端入口。
4.  在 `App.vue` 中驗證了整合結果。

下一步，我們將利用這個強大的後端來構建我們的專案管理功能！🚀
