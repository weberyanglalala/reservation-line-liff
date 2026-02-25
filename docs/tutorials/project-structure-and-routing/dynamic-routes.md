---
description: 學習如何在 Vue Router 中使用動態路由 (Dynamic Routes) 與通用字元 (Wildcards) 來建立專屬頁面，並透過 useRoute() 取得路由參數。
---

# 掌握 Vue Router 動態路由 (Dynamic Routes) 🧩

隨著應用程式變大，我們經常需要為同一類型的內容建立多個頁面，例如：部落格文章、使用者個人檔案，或是我們專案列表中的「單一專案詳情頁」。

如果為每個專案都手動建立一個路由設定 (如 `/projects/1`, `/projects/2`...)，那簡直是場災難！😱

這時候，Vue Router 的**動態路由 (Dynamic Routes)** 就派上用場了。透過使用**通用字元 (Wildcards)**，我們可以輕鬆設定一個「樣板路由」來匹配所有類似的路徑。

## 什麼是動態路由匹配？ 🤔

動態路由允許我們在路徑中定義「參數 (Parameters)」。這些參數以冒號 `:` 開頭。

例如：`/projects/:id`

- 這個路由可以匹配 `/projects/1`
- 也可以匹配 `/projects/my-awesome-app`
- 路由中 `:id` 的部分就是動態參數。

## 實作步驟 🛠️

讓我們來為每個專案建立一個獨立的詳情頁面。

### 1. 設定路由 (Router Config)

打開 `src/router/index.ts`，我們需要新增一個帶有動態參數的路由設定。

```typescript
// src/router/index.ts
// ... imports

const router = createRouter({
  // ... history config
  routes: [
    // ... 其他路由
    {
      path: '/projects/:id', // 👈 注意這裡的 :id
      name: 'single-project',
      component: () => import('@/views/SingleProjectView.vue') // 記得使用懶加載喔！
    }
  ]
})

export default router
```

### 2. 建立頁面元件 (View Component)

接著，我們需要建立對應的頁面元件 `src/views/SingleProjectView.vue`。

在這個元件中，我們如何知道網址上的 `:id` 到底是什麼呢？
Vue Router 提供了 `useRoute()` 這個 composable，讓我們可以輕鬆取得當前路由的資訊。

```vue
<!-- src/views/SingleProjectView.vue -->
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
// route.params 包含了所有路徑參數
// 例如網址是 /projects/123，那 route.params.id 就是 '123'
</script>

<template>
  <div>
    <!-- 直接在模板中顯示參數 -->
    <h1>Project {{ route.params?.id }}</h1>
  </div>
</template>
```

### 3. 如何連結到動態路由？ 🔗

當我們要使用 `RouterLink` 連結到這個頁面時，需要透過 `params` 屬性來傳遞參數：

```html
<!-- 範例：在 ProjectsView.vue 中 -->
<RouterLink :to="{ name: 'single-project', params: { id: 1 } }"> 查看專案 1 </RouterLink>
```

## 驗證成果 🔍

1.  啟動你的開發伺服器 (`npm run dev`)。
2.  在瀏覽器網址列手動輸入 `http://localhost:5173/projects/my-id-123`。
3.  你應該會看到頁面上顯示 **"Project my-id-123"**。

這代表我們成功抓取到了網址上的動態參數！🎉

## 完整範例檔案 📝

以下是本次實作的關鍵檔內容：

**src/router/index.ts**

```typescript
import HomeView from '@/views/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'

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
      component: () => import('@/views/ProjectsView.vue')
    },
    {
      path: '/projects/:id',
      name: 'single-project',
      component: () => import('@/views/SingleProjectView.vue')
    }
  ]
})

export default router
```

現在你已經學會如何處理動態路由了！這將為你的應用程式帶來極大的靈活性。繼續加油！💪
