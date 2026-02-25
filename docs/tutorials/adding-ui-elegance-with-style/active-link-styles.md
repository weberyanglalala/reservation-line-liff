---
description: 深入了解 Vue Router 的連結啟用狀態 (Active State)，並實作 Sidebar 的選單高亮效果。
---

# 精準導航體驗：掌握 Active Link 樣式與 RouterLink 實作 🧭

在現代的單頁應用程式 (SPA) 中，讓使用者清楚知道「我現在在哪裡」是非常重要的 UI 設計原則。Vue Router 提供了強大的機制來自動處理導航連結的啟用狀態 (Active State)，而透過與 Tailwind CSS 結合，我們可以輕鬆打造出既美觀又實用的側邊導航欄。

本教學將帶你深入了解 `router-link-active` 與 `router-link-exact-active` 的差異，並實作 Sidebar 的選單高亮效果。

## 什麼是 Active Link? 🤔

當你使用 `<RouterLink>` 元件建立導航連結時，Vue Router 會自動檢測當前的 URL 是否與該連結的 `to` 屬性匹配。一旦匹配成功，RouterLink 就會自動加上特定的 CSS class，這就是 **Active Link** 機制。

Vue Router 提供了兩種匹配模式：

### 1. 包含匹配 (Inclusive Match) - `router-link-active`

這是一種「寬鬆」的匹配方式。只要當前路由是連結路由的 **一部分** (包含子路由)，該連結就會被視為啟用狀態。

- **預設 class**: `router-link-active`
- **例子**:
  - 連結指向: `/users`
  - 當前路由: `/users` ✅ (Active)
  - 當前路由: `/users/123` ✅ (Active - 因為 `/users` 是 `/users/123` 的一部分)
- **用途**: 適合用於主導航選單，例如當你在瀏覽「使用者詳情頁」時，「使用者列表」的選單依然保持亮起。

### 2. 精確匹配 (Exact Match) - `router-link-exact-active`

這是一種「嚴格」的匹配方式。只有當當前路由與連結路由 **完全一致** 時，該連結才會被視為啟用狀態。

- **預設 class**: `router-link-exact-active`
- **例子**:
  - 連結指向: `/users`
  - 當前路由: `/users` ✅ (Element Active)
  - 當前路由: `/users/123` ❌ (Inactive)
- **用途**: 適合用於 Dashboard 首頁或特定功能頁面，避免在進入子頁面時造成混淆。

---

## 實作：為 Sidebar 添加啟用樣式 ✨

在我們的 `SidebarLinks.vue` 元件中，我們使用了 Tailwind CSS 來設計樣式。為了讓啟用狀態的樣式也能使用 Tailwind 的 utility classes，Vue Router 允許我們透過 `activeClass` 和 `exactActiveClass` props 來 **自定義** 啟用時要加入的 class。

讓我們來看看如何在 `src/components/Layout/SidebarLinks.vue` 中實作：

```vue
<!-- src/components/Layout/SidebarLinks.vue -->
<template>
  <RouterLink
    exactActiveClass="text-primary bg-muted"
    v-for="link in links"
    :key="link.title"
    :to="link.to"
    class="flex items-center gap-3 px-4 py-2 mx-2 transition-colors rounded-lg hover:text-primary justify-center lg:justify-normal text-muted-foreground"
  >
    <iconify-icon :icon="link.icon"></iconify-icon>
    <span class="hidden lg:block text-nowrap">{{ link.title }}</span>
  </RouterLink>
</template>
```

### 程式碼解析 🔍

1.  **`exactActiveClass="text-primary bg-muted"`**:
    - 這行程式碼告訴 Vue Router：「當這個連結被 **精確匹配 (Exact Match)** 時，請加上 `text-primary` 和 `bg-muted` 這兩個 class」。
    - `text-primary`: 將文字顏色設為主題色 (Primary Color)。
    - `bg-muted`: 將背景顏色設為柔和的灰色 (Muted Color)，營造出選中項目的背景區塊效果。

2.  **`class="..."`**:
    - 這是連結的 **基本樣式**，無論是否啟用都會套用。
    - 我們設定了 `text-muted-foreground` 作為預設文字顏色，這樣未選中的連結會呈現較淡的顏色。
    - 當連結變為 Active 時，`text-primary` (來自 `exactActiveClass`) 會覆蓋 `text-muted-foreground`，實現顏色變化的效果。

## 為什麼選擇 `exactActiveClass`? 💡

在側邊欄 (Sidebar) 的情境中，每個選項通常代表一個獨立的功能頁面 (例如：首頁、專案列表、設定)。

如果我們使用 `activeClass` (寬鬆匹配)，當你導航到首頁 `/` 時，因為所有路由都包含 `/`，可能會導致所有連結都亮起來 (如果其他連結也是以 `/` 開頭的路徑)。或者在巢狀路由結構中，可能會讓父層和子層同時亮起，這在某些設計中是期望的，但在扁平化的 Sidebar 選單中，我們通常希望使用者清楚知道「我現在點擊的是哪一個選項」。

使用 `exactActiveClass` 可以確保只有當使用者 **確實** 停留在該頁面時，該選項才會高亮，提供最精確的視覺回饋。

---

## 💪 動手做做看

試試看修改 `exactActiveClass` 的值，體驗不同的高亮效果：

- **反白效果**: `exactActiveClass="bg-primary text-primary-foreground"` (深色背景，亮色文字)
- **邊框效果**: `exactActiveClass="border-r-4 border-primary bg-muted/50"` (右側亮條，半透明背景)

透過靈活運用 Vue Router 的 Active Class 機制，你可以輕鬆打造出符合專案風格的導航體驗！ happy coding! 🚀
