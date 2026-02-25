---
description: 學習如何設定 Vue Router，建立專案列表與專案詳情頁面路由，並使用 RouterLink 實現無刷新導航。
---

# 打造流暢的單頁應用體驗：Vue Router 與路由導航設定 🚦

隨著我們規劃專案管理應用程式，將其組織成不同的頁面至關重要。我們需要一個頁面來查看所有專案，以及另一個頁面來查看特定專案的細節。為了在這些頁面之間順暢導航，我們將設置 Vue Router。我們將建立必要的路由，設定它們，並使用 `RouterLink` 組件來啟用平滑的導航。這確保了出色的單頁應用 (SPA) 體驗。

## 1. 建立視圖組件 (Create View Components) 🏗️

首先，我們需要在 `src/views` 目錄下建立對應的頁面組件。如果 `views` 資料夾不存在，請先建立它。

### 專案列表頁面 (Projects View)

建立 `src/views/ProjectsView.vue`：

```vue
<script setup lang="ts">
// 這裡之後會加入獲取專案列表的邏輯
</script>

<template>
  <div class="projects-view">
    <h1>All Projects</h1>
    <p>這裡將顯示所有專案的清單。</p>

    <!-- 暫時的導航連結，用於測試動態路由 -->
    <ul>
      <li><RouterLink to="/projects/1">Project 1 Details</RouterLink></li>
      <li><RouterLink to="/projects/2">Project 2 Details</RouterLink></li>
    </ul>
  </div>
</template>
```

### 單一專案頁面 (Single Project View)

建立 `src/views/SingleProjectView.vue`：

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
// 我們可以透過 route.params.id 獲取路由參數
</script>

<template>
  <div class="single-project-view">
    <h1>Project Details</h1>
    <p>正在查看專案 ID: {{ route.params.id }}</p>

    <RouterLink to="/projects">← Back to Projects</RouterLink>
  </div>
</template>
```

## 2. 設定路由配置 (Configure Routes) 🗺️

接下來，我們需要告訴 Vue Router 如何將網址路徑 (URL Path) 對應到我們剛建立的組件。

開啟 `src/router/index.ts` 並修改如下：

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue' // 如果有的話
import ProjectsView from '../views/ProjectsView.vue'
import SingleProjectView from '../views/SingleProjectView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/projects' // 將首頁重定向到專案列表
    },
    {
      path: '/projects',
      name: 'projects',
      component: ProjectsView
    },
    {
      path: '/projects/:id', // :id 表示這是一個動態參數
      name: 'single-project',
      component: SingleProjectView
    }
  ]
})

export default router
```

> **小知識 💡**: `:id` 是動態路由參數 (Dynamic Segment)。當使用者訪問 `/projects/123` 時，`123` 會被捕捉並放入 `route.params.id` 中。

## 3. 更新應用程式入口 (Update App Entry) 🚪

最後，我們需要在 `src/App.vue` 中放置 `<RouterView />`，這是路由組件渲染的地方。同時，我們也可以加入全域導航列。

修改 `src/App.vue`：

```vue
<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/projects">Projects</RouterLink>
      </nav>
    </div>
  </header>

  <main>
    <!-- 路由匹配到的組件將會顯示在這裡 -->
    <RouterView />
  </main>
</template>

<style scoped>
nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #f0f0f0;
  margin-bottom: 2rem;
}

nav a {
  text-decoration: none;
  color: #2c3e50;
  font-weight: bold;
}

nav a.router-link-active {
  color: #42b983;
}
</style>
```

## 4. 關鍵比較：RouterLink vs HTML a 標籤 ⚖️

在開發 Vue 應用時，你可能會疑惑：「為什麼不直接用標準的 HTML `<a>` 標籤就好？」讓我們來看看兩者的關鍵差異：

| 特性           | `<RouterLink>` (推薦)        | `<a href="...">` (不推薦)                  |
| :------------- | :--------------------------- | :----------------------------------------- |
| **頁面刷新**   | **無刷新** (No Reload)       | **全頁刷新** (Full Page Reload)            |
| **運作機制**   | 攔截點擊事件，僅切換組件內容 | 瀏覽器發送新請求，重新下載所有 HTML/CSS/JS |
| **使用者體驗** | 絲滑順暢，像原生 App         | 會有明顯的白屏閃爍                         |
| **狀態保留**   | 保留 Pinia/Vuex 狀態與變數   | 狀態會全部重置                             |

> **結論 💡**: 在應用程式**內部頁面**切換時，請務必使用 `<RouterLink>`。只有在需要連結到**外部網站** (例如 Google, Facebook) 時，才使用傳統的 `<a>` 標籤。

## 5. 驗證成果 (Verify Results) ✅

現在，啟動你的開發伺服器：

```bash
npm run dev
```

打開瀏覽器，你應該能看到：

1.  首頁會自動跳轉到 `/projects`。
2.  點擊 "Projects" 會停留在列表頁。
3.  點擊列表中的連結（如 "Project 1 Details"）會進入 `/projects/1`，並且 URL 會改變，但頁面不會重新載入。
4.  在詳情頁點擊 "Back to Projects" 能順利返回。

恭喜！你已經成功為專案管理應用建立了基礎的路由架構！ 🎉
