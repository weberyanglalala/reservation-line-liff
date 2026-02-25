---
description: 學會如何在 Vue Router 中設定捕捉所有未定義路由 (Catch-all routes) 並建立自定義的 404 錯誤頁面，提升使用者體驗。
---

# 捕捉未定義路由與建立 404 頁面 🚫 (Catch All Undefined Routes)

在開發網頁應用時，處理使用者輸入錯誤網址或存取不存在頁面的情況至關重要。如果不加以處理，使用者可能會看到一片空白或預設的醜醜錯誤訊息，這對體驗來說是大扣分！😱

本單元將教你如何使用 Vue Router 的 **Catch-all (捕捉所有)** 路由功能，優雅地攔截這些請求，並展示我們精心設計的 `Not Found` 頁面。我們還會學習如何針對特定路徑（如 `/projects`）底下的錯誤進行更細緻的控制。

## 本單元重點 🌟

1.  **建立 404 頁面元件**: 製作一個友善的錯誤提示頁面。
2.  **設定全域 Catch-all 路由**: 捕捉所有未匹配的路徑。
3.  **設定巢狀 Catch-all 路由**: 針對特定區塊 (如 `/projects`) 進行錯誤攔截。

---

## 1. 建立 404 頁面元件 🧩

首先，我們不要用冷冰冰的文字，而是建立一個正式的 Vue 元件來顯示 404 訊息。

請在 `src/views` 資料夾下建立一個新檔案 `NotFoundView.vue`：

```vue
<!-- src/views/NotFoundView.vue -->
<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="not-found">
    <h1>404</h1>
    <h2>Oops! 找不到頁面 🙈</h2>
    <p>你似乎迷路了，這個頁面不存在。</p>
    <RouterLink to="/" class="back-home">回首頁 🏠</RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 50px;
}

h1 {
  font-size: 6rem;
  color: var(--color-heading);
  margin-bottom: 0;
}

h2 {
  font-size: 2rem;
  margin-top: 10px;
}

.back-home {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.back-home:hover {
  background-color: #3aa876;
}
</style>
```

這樣我們就有了一個漂亮的 404 頁面了！✨

---

## 2. 設定全域 Catch-all 路由 🕸️

接下來，我們要告訴 Vue Router：「如果有任何網址是你看不懂的，通通導向這個 `NotFoundView`！」

打開 `src/router/index.ts`，我們需要使用特殊的正則表達式語法 `/:pathMatch(.*)*` (或舊版常用的 `/:catchAll(.*)*`) 來定義一個捕捉所有路徑的路由。

> **💡 小知識**: `pathMatch(.*)*` 中的 `(.*)` 代表匹配任意字元，最後的 `*` 代表匹配零次或多次，這讓它能捕捉 `/something` 甚至是 `/something/nested/deeply` 這樣多層級的路徑。

請在 `routes` 陣列的 **最後面** 加入以下設定：

**⚠️ 重要提醒**: Catch-all 路由必須放在 `routes` 陣列的**最後一個**，因為 Vue Router 是由上往下進行匹配的。如果放在最前面，所有頁面都會變成 404！

```typescript
// src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
// 引入我們剛建立的 NotFoundView
import NotFoundView from '../views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    // ... 其他路由 ...

    // 👇 全域 404 路由設定
    {
      // 使用正則表達式捕捉所有未定義路徑
      path: '/:catchAll(.*)*',
      name: 'not-found',
      component: NotFoundView // 指向我們的 404 元件
    }
  ]
})

export default router
```

### 為什麼要這樣寫？

- **`/:catchAll(.*)*`**: 這是 Vue Router 4 的語法，告訴 Router 把剩下沒人要的路徑都收進來，並且把路徑參數存放在 `route.params.catchAll` 中。

---

## 3. 針對特定路徑的細緻控制 (巢狀 Catch-all) 🎯

有時候，你可能不希望所有錯誤都導向同一個通用的 404 頁面。例如，使用者輸入錯誤的 `/projects/xxx` 網址時，你希望告訴他：「是『專案』找不到，而不是整個網站壞掉」。

我們可以在全域 Catch-all 之前，加入一個針對 `/projects` 的捕捉規則。

在 `src/router/index.ts` 中加入：

```typescript
// src/router/index.ts

const router = createRouter({
  // ...
  routes: [
    // ... 其他路由

    // 👇 針對 /projects 下的錯誤路由
    {
      path: '/projects/:catchAll(.*)*',
      name: 'project-not-found',
      component: NotFoundView, // 這裡你可以換成專屬於 Project 的 404 元件
      // 或者傳遞 props 讓同一個元件顯示不同訊息
      props: { message: '找不到該專案 📁' }
    },

    // 👇 全域 404 (必須放在最後)
    {
      path: '/:catchAll(.*)*',
      name: 'not-found',
      component: NotFoundView
    }
  ]
})
```

這樣一來：

- 訪問 `/projects/abc` -> 觸發 `project-not-found` 路由。
- 訪問 `/about/abc` -> 觸發 `not-found` 路由。

---

## 💪 動手做做看

1.  確認你的 `src/views` 目錄下已經建立了 `NotFoundView.vue`。
2.  修改 `src/router/index.ts`，將原本使用 `h('p', ...)` 的簡單寫法，改為引入並使用 `NotFoundView` 元件。
3.  試著在瀏覽器網址列隨便打一串亂碼，看看是否成功顯示了你的 404 頁面！🚀
4.  如果你有設定 `/projects` 路由，試試看 `/projects/random-id` 是否也能正確被捕捉。

## 總結 📝

處理 404 頁面是提升使用者體驗的小細節，但影響巨大。透過 Vue Router 強大的動態路由匹配功能，我們可以輕鬆地捕捉並處理這些「迷路」的請求，引導使用者回到正確的方向。

現在，你的應用程式再也不會有尷尬的空白頁面了！🎉
