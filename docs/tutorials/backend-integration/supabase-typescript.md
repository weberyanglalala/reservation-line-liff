---
description: 學習如何自動生成 Supabase 資料庫的 TypeScript 型別定義，並在 Vue 專案中應用這些型別來提升開發體驗與代碼品質。
---

# 增強 Supabase 與 TypeScript 的整合體驗：自動生成型別定義 📐

有了 TypeScript，我們可以直接在代碼編輯器中清楚地查看資料庫結構，讓開發過程更高效、更愉快。在本節課中，我們將教你如何增強 Supabase 與 TypeScript 的整合。我們將展示如何自動生成並使用 Supabase 資料庫架構的 TypeScript 型別，確保你始終擁有最新的型別定義。

## 為什麼需要自動生成型別？ 🤔

在使用 Supabase 開發時，如果我們手動定義資料庫表的 TypeScript 介面（Interface），不僅耗時，而且當資料庫結構改變時，很容易忘記更新型別，導致潛在的錯誤。

Supabase CLI 提供了強大的 `gen types` 功能，可以直接從資料庫 Schema 自動分析並生成準確的 TypeScript 定義檔。這樣一來：

- **自動補全（IntelliSense）**：輸入 `supabase.from('` 時，編輯器會自動列出所有表名。
- **型別檢查**：選擇欄位或篩選條件時，TypeScript 會檢查是否符合資料型別，防止拼寫錯誤。
- **單一真理來源**：資料庫 Schema 就是型別的唯一來源，減少維護成本。

## 實作步驟 🛠️

### 1. 新增生成型別的腳本 📜

首先，我們需要在 `package.json` 中加入一個新的 script，方便我們隨時更新型別定義。

打開 `package.json`，在 `scripts` 區塊中加入 `supabase:types` 指令：

```json:package.json
{
  "scripts": {
    // ... 其他 scripts
    "supabase:link": "source .env && supabase link --project-ref $SUPABASE_PROJECT_ID",
    "supabase:types": "source .env && npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID --schema public > database/types.ts"
  }
}
```

這個指令會：

1. 讀取 `.env` 檔案中的環境變數。
2. 使用 `supabase gen types typescript` 指令。
3. 指定專案 ID (`$SUPABASE_PROJECT_ID`)。
4. 將生成的型別輸出到 `database/types.ts` 檔案中。

### 2. 執行生成腳本 🚀

現在，讓我們執行剛剛新增的指令來生成型別檔案：

```bash
npm run supabase:types
```

執行成功後，你會在專案根目錄下的 `database` 資料夾中看到一個新產生的 `types.ts` 檔案。如果你打開它，會發現裡面包含了 `Database` 介面以及好用的 `Tables`、`Enums` 等輔助型別。

### 3. 設定 TypeScript 包含路徑 ⚙️

為了讓 Vue 專案能夠正確識別並使用這個新生成的型別檔案，我們需要更新 `tsconfig.app.json`。

打開 `tsconfig.app.json`，將 `database/types.ts` 加入到 `include` 陣列中：

```json:tsconfig.app.json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue", "typed-router.d.ts", "database/types.ts"],
  "exclude": ["src/**/__tests__/*"],
  // ... 其他設定
}
```

### 4. 在 Supabase Client 中注入型別 💉

最後一步，也是最重要的一步，就是告訴我們的 `supabase` 客戶端使用這些型別。

打開 `src/lib/supabaseClient.ts`，引入生成的 `Database` 型別，並將其傳遞給 `createClient`：

```typescript:src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../database/types'

// Create a single supabase client for interacting with your database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

現在，當你在專案中使用 `supabase` 實例時，它已經完全掌握了你的資料庫結構！

## 實際應用範例 💡

讓我們看看在 `src/pages/projects/index.vue` 中如何使用。現在當你鍵入代碼時，你會發現強大的自動補全功能出現了：

```vue:src/pages/projects/index.vue
<script setup lang="ts">
import { supabase } from '@/lib/supabaseClient'
import { ref } from 'vue'
import type { Tables } from '../../../database/types'

// 使用 Tables 輔助型別定義 projects 陣列
const projects = ref<Tables<'projects'>[] | null>(null)

const getProjects = async () => {
  // 這裡 TypeScript 會知道 'projects' 是一個合法的表名
  // select() 的回傳結果也會被正確推斷
  const { data, error } = await supabase.from('projects').select()

  if (error) console.log(error)

  // data 的型別會被正確推斷為 projects 表的陣列，可以直接賦值
  projects.value = data
  console.log('Projects', projects.value)
}

;(async () => {
  await getProjects()
})()
</script>

<template>
  <div>
    <h1>Projects</h1>
    <RouterLink to="/">Home Pages</RouterLink>
    <ul>
      <li v-for="project in projects" :key="project.id">
        {{ project.name }}
      </li>
    </ul>
  </div>
</template>
```

## 小結 🎉

透過以上簡單的步驟，我們成功地將 TypeScript 的強大能力引入到了 Supabase 開發流程中。現在：

1. 資料庫結構變更後，只需執行 `npm run supabase:types`。
2. 前端代碼會立即獲得最新的型別定義。
3. 開發過程中能即時發現型別錯誤，無需等到執行時。

這將大大提升你的開發效率與代碼的可靠性！ 💪
