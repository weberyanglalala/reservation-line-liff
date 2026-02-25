---
description: 學習如何將 Iconify Web Component 整合到 Vue 專案中，並使用數千種高品質圖示提升 UI 體驗。
---

# 靈活運用 Iconify：在 Vue 中整合 Web Component 圖標 🎨

在現代網頁開發中，圖示 (Icons) 是提升 UI 美感與使用者體驗的關鍵元素。傳統的 SVG 管理方式（手動引入）往往繁瑣且不易維護。本教學將介紹如何使用 `iconify-icon` Web Component，讓您能夠輕鬆取用數千個開源圖示庫，並優化專案開發流程。

## 什麼是 Web Component？ 🤔

Web Components 是一組瀏覽器原生的 API，允許開發者建立可重複使用的自定義 HTML 標籤（Custom Elements）。這些元件封裝了自己的 HTML 結構、CSS樣式與邏輯，並且可以跨框架（如 Vue, React, Angular）甚至在純 HTML 中使用。

`iconify-icon` 就是一個基於 Web Component 技術構建的圖示元件。它允許我們像使用普通 HTML 標籤一樣使用它，只需指定圖示名稱即可動態載入 SVG。

## 1. 安裝與設定 (Installation & Setup)

首先，我們需要安裝 `iconify-icon` 套件。請在終端機執行以下指令：

```bash
npm install iconify-icon
```

### 設定 Vite config (Vite Configuration)

由於 `iconify-icon` 是一個自定義元素（Custom Element），Vue 的編譯器預設會嘗試解析所有標籤為 Vue 元件。為了避免 Vue 發出 "Failed to resolve component: iconify-icon" 的警告，我們需要在 `vite.config.ts` 中告訴 Vue 編譯器忽略這個標籤。

請修改 `vite.config.ts` 中的 `vue()` 插件設定：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 告訴 Vue 編譯器，所有以 'iconify-icon' 開頭的標籤都是自定義元素，不需要解析為 Vue 元件
          isCustomElement: (element) => element.startsWith('iconify-icon')
        }
      }
    })
    // ... 其他插件
  ]
  // ... 其他設定
})
```

### 註冊元件 (Register in Main.ts)

接下來，我們需要在應用程式的入口點 `src/main.ts` 中引入 `iconify-icon`，以確保瀏覽器能夠識別並註冊這個 Web Component。

```typescript
// src/main.ts
import './style.css'
import 'iconify-icon' // ✨ 引入 iconify-icon，自動註冊 Web Component
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

## 2. 在元件中使用 (Usage in Component)

設定完成後，您就可以在任何 Vue 元件中使用 `<iconify-icon>` 標籤了！

### 尋找圖示

您可以到 [Icones](https://icones.js.org/) 或 [Iconify](https://icon-sets.iconify.design/) 網站搜尋您需要的圖示。例如，我們想使用 Lucide Icons 的搜索圖示，其名稱為 `lucide:search`。

### 範例：在 App.vue 中添加搜索圖示

讓我們修改 `src/App.vue`，在搜尋框中添加一個圖示：

```vue
<template>
  <nav class="h-16 border-b bg-muted/40 flex justify-between px-6 items-center">
    <form class="relative w-full h-fit max-w-96">
      <!-- ✨ 使用 iconify-icon -->
      <iconify-icon
        icon="lucide:search"
        class="absolute top-[50%] translate-y-[-50%] left-2.5 text-muted-foreground"
      ></iconify-icon>

      <Input class="w-full pl-8 bg-background" type="text" placeholder="Search ..." />
    </form>
    <!-- ... 其他內容 -->
  </nav>
</template>
```

## 3. CSS 技巧解析 (CSS Tips) 💡

在上面的範例中，我們使用了一些實用的 Tailwind CSS 技巧來定位圖示，讓我們來深入了解一下：

### 垂直置中 (Vertical Centering)

要將圖示完美地垂直置中於輸入框內，我們使用了以下組合：

- `absolute`: 將圖示設定為絕對定位（相對於父容器 `form`，該容器需設為 `relative`）。
- `top-[50%]`: 將圖示的**頂部邊緣**移動到父容器高度的 50% 處。
- `translate-y-[-50%]`: 將圖示**自身**向上移動其自身高度的 50%。

這個組合 (`top: 50%; transform: translateY(-50%);`) 是 CSS 中最經典且穩健的垂直置中技巧之一，確保圖示中心點與容器中心點對齊。

### 理解 fit-content (h-fit)

我們在 `form` 標籤上使用了 `h-fit`，這對應到 CSS 的 `height: fit-content`。

**什麼是 `fit-content`？**

`fit-content` 是一個 CSS 屬性值，它的行為像是 `max-content` 和 `min-content` 的混合體，但受限於可用空間。簡單來說：

- 它會讓元素的高度**剛好包覆其內容**（在這個例子中是 `Input` 元件的高度）。
- 如果內容變多，它會長大；如果內容變少，它會縮小。
- 它不會像固定高度（如 `h-10`）那樣死板，也不會像 `h-full` 那樣無限制地佔據父容器空間。

這對於像搜尋框容器這樣的包裝元素非常有用，確保容器只需根據內部 `Input` 元件的高度自動調整，而不會產生多餘的空白或溢出。

## 結語

通過引入 `iconify-icon`，我們不僅解決了圖示管理的問題，還獲得了極大的靈活性。搭配 Tailwind CSS 的定位技巧，我們可以輕鬆打造出細緻且專業的 UI 介面。現在，試著在您的專案中加入更多圖示吧！🚀
