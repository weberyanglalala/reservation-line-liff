---
description: 學習如何透過 Vue Router 的路由懶加載 (Lazy Loading) 降低初始載入時間，提升應用程式效能。
---

# 優化應用程式效能：路由懶加載 (Lazy Loading) ⚡️

即使是結構良好的 Vue Router 設定，也可能隱藏效能陷阱。開發時最常見的問題之一，就是將所有頁面元件一次性打包載入。這會導致不必要的 JavaScript 檔案讓瀏覽器「消化不良」，拖慢首頁載入速度。

在本教學中，我們將解決這個問題，利用 Vue Router 的懶加載 (Lazy Loading) 支援與 Vite 的動態匯入 (Dynamic Imports) 功能。這能確保元件只在需要時才載入，讓你的應用程式保持輕快且靈敏。

## 為什麼需要懶加載？ 🤔

試想一下，如果你的網站有 20 個頁面，使用者第一次進入首頁時，真的需要把另外 19 個頁面的程式碼都下載下來嗎？🤔

當然不需要！這就是**懶加載 (Lazy Loading)** 派上用場的時候。它的核心概念是：**「用到才載入」**。

- ❌ **標準匯入 (Standard Import)**：所有元件打包在一起，初始載入慢。
- ✅ **動態匯入 (Dynamic Import)**：將元件分割成小塊 (Chunks)，切換路由時才下載，初始載入快。

## 實作懶加載：從標準匯入改為動態匯入 🛠️

讓我們看看如何將路由設定改為懶加載。

### 1. 檢視原始設定 (標準匯入)

在 `src/router/index.ts` 中，通常你會看到這樣的寫法：

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
// ⚠️ 這裡在檔案最上方直接匯入元件
import ProjectsView from '@/views/ProjectsView.vue'

const router = createRouter({
  // ... 其他設定
  routes: [
    {
      path: '/projects',
      name: 'projects',
      component: ProjectsView // 直接使用匯入的元件
    }
  ]
})
```

### 2. 改為動態匯入 (Dynamic Import)

要啟用懶加載非常簡單，只要移除頂部的 `import`，並在 `component` 屬性中使用箭頭函式回傳 `import()` 即可：

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
// 移除 ProjectsView 的頂部匯入

const router = createRouter({
  // ... 其他設定
  routes: [
    {
      path: '/projects',
      name: 'projects',
      // ✨ 使用動態匯入
      // Vite 會自動將此元件分割成獨立的 JavaScript 檔案
      component: () => import('@/views/ProjectsView.vue')
    }
  ]
})
```

就這樣！Vite 與 Vue Router 會自動處理剩下的事情。

## 驗證懶加載是否生效 🔍

我們可以使用瀏覽器的開發者工具 (DevTools) 來驗證。

1. 打開瀏覽器開發者工具 (F12)。
2. 切換到 **Network** (網路) 頁籤。
3. 重新整理頁面，確保一開始只載入了必要的檔案。
4. 點擊導航連結前往 `/projects` 頁面。
5. 觀察 Network 頁籤，你會看到一個新的 `.js` 檔案 (例如 `ProjectsView.vue_vue_type_script_setup_true_lang.js` 或類似名稱) 被發送請求並載入。

這代表懶加載成功運作了！🎉

## 💡 小訣竅：首頁通常保留標準匯入

雖然懶加載很棒，但通常建議**首頁 (Landing Page)** 或使用者最常訪問的入口頁面，保持**標準匯入 (Standard Import)**。

```typescript
// src/router/index.ts
import HomeView from '@/views/HomeView.vue' // 🏠 首頁保持標準匯入

const router = createRouter({
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView // 這樣首屏渲染速度最快
    }
    // 其他頁面使用懶加載...
  ]
})
```

原因在於首頁是使用者第一眼看到的內容，將其獨立分割反而可能增加 HTTP 請求的往返時間 (Round Trip Time)，並不一定划算。

## 完整範例參考 📝

以下是優化後的 `src/router/index.ts` 完整範例：

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/projects',
      name: 'projects',
      // 🚀 懶加載 ProjectsView
      component: () => import('@/views/ProjectsView.vue')
    }
  ]
})

export default router
```

現在，你的應用程式已經更加輕量且高效了！繼續保持！💪
