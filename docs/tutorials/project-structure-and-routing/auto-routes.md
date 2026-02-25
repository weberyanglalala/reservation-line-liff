---
description: 學習如何使用 unplugin-vue-router 實現檔案基礎路由 (File-based Routing)，並整合 TypeScript 提升開發體驗。
---

# 解放雙手：Vue Router 自動路由與 TypeScript 支援 (Auto Routes) 🚀

在本章節中，我們將學習如何利用 `unplugin-vue-router` 來自動化 Vue Router 的路由設定。這將使我們的開發流程更加順暢，並透過 TypeScript 提供更好的型別安全。

## 為何選擇自動路由？

手動維護路由設定檔 (`router/index.ts`) 往往隨著專案變大而變得繁瑣且容易出錯。
設定自動路由 (Auto Routes) 後，我們只需遵循檔案結構的約定（例如在 `src/pages` 中建立檔案），路由就會自動生成。這不僅讓程式碼更簡潔，也讓專案結構更直觀。

就像 Nuxt.js 一樣，我們將透過檔案結構來決定路由，同時保有 TypeScript 的強大支援！✨

## 📦 安裝與設定

首先，我們需要安裝 `unplugin-vue-router`。這是一個建構時的插件，能自動掃描檔案並產生路由定義。

### 1. 安裝套件

執行以下指令安裝 `unplugin-vue-router`：

```bash
npm install -D unplugin-vue-router@^0.19.2
```

> **💡 提示**：為了確保與本教學範例的一致性，建議使用上述版本。同時，請確認您的 `vue-router` 版本為 `^4.0.0` (本專案使用 `^4.6.4`)，以避免相容性問題。

### 2. 設定 Vite Config

接著，我們需要在 `vite.config.ts` 中引入並設定此插件。

開啟 `vite.config.ts`，加入 `VueRouter` 插件：

```typescript
// vite.config.ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import VueRouter from 'unplugin-vue-router/vite' // 1. 引入插件

export default defineConfig({
  plugins: [
    // 2. 將 VueRouter() 加入插件列表
    // 建議將其放在 vue() 之前，雖然放在後面通常也能運作，但官方推薦在前。
    VueRouter(),
    vue(),
    vueDevTools()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

### 3. 設定 TypeScript

為了讓 TypeScript 能夠識別自動產生的路由與型別，我們需要調整 `tsconfig.app.json`。

開啟 `tsconfig.app.json`，在 `include` 陣列中加入 `typed-router.d.ts`，並設定 `moduleResolution`：

```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": [
    "env.d.ts",
    "src/**/*",
    "src/**/*.vue",
    "typed-router.d.ts" // 1. 加入型別定義檔
  ],
  "exclude": ["src/**/__tests__/*"],
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "moduleResolution": "bundler", // 2. 設定模組解析策略
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

這會告訴 TypeScript 編譯器去包含 `unplugin-vue-router` 自動生成的型別宣告檔。

---

## 🛠️ 重構路由設定

現在我們已經設定好環境，接下來要修改 `src/router/index.ts` 來使用自動產生的路由。

### 1. 更新 Router 實例

開啟 `src/router/index.ts`，將手動定義的 `routes` 陣列替換為從 `vue-router/auto-routes` 匯入的 `routes`：

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes' // 1. 匯入自動路由

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes // 2. 直接使用匯入的 routes
})

export default router
```

這行簡單的程式碼背後，其實發生了很多魔法！`unplugin-vue-router` 會在編譯時掃描 `src/pages` 資料夾，並自動生成對應的路由設定。

---

## 📂 調整檔案結構

為了配合檔案基礎路由的慣例，我們需要將頁面組件從 `src/views` 移動到 `src/pages`。

### 1. 建立 Pages 目錄

在 `src` 下建立 `pages` 資料夾：

```bash
mkdir src/pages
```

### 2. 移動並重新命名檔案

將原本在 `src/views` 的檔案移動到 `src/pages`。根據檔案名稱，路由路徑會自動對應：

- `HomeView.vue` -> `src/pages/index.vue` (對應路徑 `/`)
- `ProjectsView.vue` -> `src/pages/projects.vue` (對應路徑 `/projects`)
- `SingleProjectView.vue` -> `src/pages/projects/[id].vue` (對應路徑 `/projects/:id`)

> **注意**：在本專案目前的實作中，我們暫時保留了原本的檔名結構（如 `src/pages/HomeView.vue`），但在標準的檔案路由慣例中，通常會使用 `index.vue` 來代表根路徑或是目錄的預設頁面。`unplugin-vue-router` 預設會掃描 `src/pages` 下的 `.vue` 檔案。
>
> 根據您的 git 紀錄，目前的檔案結構已調整為：
>
> - `src/pages/HomeView.vue`
> - `src/pages/ProjectsView.vue`
> - `src/pages/SingleProjectView.vue`
>
> 您可能需要根據需求進一步將檔名標準化（例如 `HomeView.vue` 改為 `index.vue`），以完全發揮檔案路由的路徑對應功能。若維持現狀，路由可能會變成 `/HomeView` 等。

**💪 小挑戰**：嘗試將 `HomeView.vue` 重新命名為 `index.vue`，看看瀏覽器中的路由是否自動變成了首頁 `/`！

---

## ✅ 驗證結果

完成上述步驟後，啟動開發伺服器：

```bash
npm run dev
```

觀察終端機，您應該不會看到任何錯誤。嘗試在瀏覽器中導航，路由應該能正常運作。同時，在撰寫程式碼時，嘗試輸入 `<RouterLink to="...">`，您會發現 TypeScript 現在能提供路由名稱的自動完成提示了！這就是 `typed-router.d.ts` 的功勞。

## 總結

透過引入 `unplugin-vue-router`，我們成功實現了：

1.  **自動化路由生成**：不再需要手動維護龐大的路由陣列。
2.  **型別安全**：享受 TypeScript 帶來的自動完成與錯誤檢查。
3.  **結構化管理**：透過檔案資料夾結構直觀地管理頁面。

現在，您的 Vue 專案已經具備了現代化且高效的路由系統！ 🎉
