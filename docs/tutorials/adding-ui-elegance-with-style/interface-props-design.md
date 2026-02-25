---
description: 透過 TypeScript 定義元件 Props 介面，打造強型別且易維護的 Vue 組件。
---

# 打造可維護的元件介面：TypeScript Props 設計與實踐 🧩

## 簡介 (Introduction)

在 Vue 應用程式中，元件 (Components) 之間的資料傳遞是核心機制。隨著專案擴大，如果沒有明確定義 Props 的結構，很容易導致資料錯誤或難以維護。本教學將引導您如何在 `SidebarLinks` 元件中使用 TypeScript 介面 (Interface) 來設計 Props，確保資料傳遞的正確性與清晰度。

## 為什麼需要介面設計？ (Why Interface Design?)

想像一下，如果我們只告訴組件「給我一個陣列」，但沒說陣列裡要有什麼，組件可能會收到錯誤的資料導致崩潰。透過 TypeScript Interface，我們可以清楚地定義：

- 每個連結物件必須包含哪些屬性（例如：`title`、`to`、`icon`）。
- 這些屬性的型別是什麼（例如全部都是 `string`）。

這樣一來，無論是開發者在撰寫程式碼時，或是編譯器在檢查時，都能確保資料結構的一致性。 🛡️

## 實作步驟 (Implementation Steps)

### 1. 定義介面 (Define Interface)

首先，在 `src/components/Layout/SidebarLinks.vue` 中，我們定義一個 `LinkProp` 介面，明確規範單個連結物件的結構。

```typescript
interface LinkProp {
  title: string
  to: string
  icon: string
}
```

### 2. 使用 defineProps 接收資料 (Using defineProps)

接著，我們使用 Vue 的 `defineProps` 巨集，並結合剛定義的介面，來宣告元件接收的 `links` 屬性是一個 `LinkProp` 的陣列。

```vue
<script setup lang="ts">
interface LinkProp {
  title: string
  to: string
  icon: string
}

defineProps<{
  links: LinkProp[]
}>()
</script>
```

這樣做的好處是，當我們在父元件傳入錯誤的結構時，TypeScript 馬上就會報錯提醒我們！ 🚨

### 3. 父元件的資料傳遞 (Passing Data from Parent)

在父元件 `src/components/Layout/Sidebar.vue` 中，我們準備符合 `LinkProp` 結構的資料陣列，並透過 Props 傳遞給 `SidebarLinks`。

```vue
<script setup lang="ts">
import SidebarLinks from './SidebarLinks.vue'

// 定義符合介面結構的資料
const links = [
  { title: 'Dashboard', to: '/', icon: 'lucide:house' },
  { title: 'Projects', to: '/projects', icon: 'lucide:building-2' },
  { title: 'Tasks', to: '/tasks', icon: 'lucide:badge-check' }
]

const accountLinks = [
  { title: 'Profile', to: '/profile', icon: 'lucide:user' },
  { title: 'Settings', to: '/settings', icon: 'lucide:settings' },
  { title: 'Signout', to: '/signout', icon: 'lucide:log-out' }
]
</script>

<template>
  <!-- ...略... -->
  <nav class="flex flex-col gap-2 justify-between h-full relative">
    <div>
      <!-- 傳遞 links -->
      <SidebarLinks :links="links" />
    </div>

    <div class="border-y text-center bg-background py-3">
      <!-- 傳遞 accountLinks，同樣符合結構 -->
      <SidebarLinks :links="accountLinks" />
    </div>
  </nav>
  <!-- ...略... -->
</template>
```

## 結語 (Conclusion)

透過 TypeScript 介面來設計 Props，我們不僅讓程式碼更具可讀性，也大幅降低了因為資料結構錯誤而產生的 Bug。這種明確的契約 (Contract) 設計，是打造大型 Vue 應用程式的基石。 🏗️

現在，您的側邊欄組件不僅外觀優雅，內在結構也同樣堅固！ 💪
