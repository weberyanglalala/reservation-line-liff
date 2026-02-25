---
description: 了解 Vue 3 的 Suspense 元件，並學習如何處理在使用頂層 await 或非同步元件時所發生的錯誤。
---

# 探索 Vue 3 的 Suspense 元件 ⏳

嗨！在整合非同步資料或是建立載入畫面時，你有沒有在開發過程中遇過這個 Vue 警告呢？

```text
[Vue warn]: Component <Anonymous>: setup function returned a promise, but no <Suspense> boundary was found in the parent component tree. A component with async setup() must be nested in a <Suspense> in order to be rendered.
```

不要慌張！這是一個非常常見的錯誤 🚀。這篇教學會帶你了解什麼是 `<Suspense>`，為什麼會出現這個警告，以及我們該如何優雅地解決它！

## 💡 為什麼會出現這個警告？

在 Vue 3 中，如果你在 `<script setup>` 裡面使用了最高層級的 `await`（也就是 Top-level await），或者使用 `defineComponent` 回傳了一個 `async setup()`，Vue 會將這個元件視為一個**非同步元件 (Async Component)**。

就像你提供的 `MocComponent` 範例一樣：

```typescript
const MocComponent = defineComponent(async () => {
  const greeting = ref('Hello')

  await new Promise((resolve) => {
    greeting.value = 'Hello from the database!'
    resolve(true)
  })

  return () => h('p', greeting.value)
})
```

或者在一般的 `<script setup>` 的情況：

```vue
<script setup lang="ts">
// 🚨 直接在最外層使用 await
await getProjects()
</script>
```

在這些情況下，元件在開始渲染畫面之前，必須等待 Promise 執行完畢（例如從資料庫把資料載入回來）。然而，Vue 不知道在「等待的這段時間內」應該要顯示什麼給使用者看，所以就會噴出這個警告，並拒絕渲染。

## 🧩 什麼是 Suspense？

`<Suspense>` 是 Vue 3 提供的一個內建元件。你可以把它想像成一個「非同步工作站」或是「緩衝區」。

當被它包覆的子元件還在等資料（Pending）時，`<Suspense>` 會負責將備用的內容（Fallback，例如 Loading 畫面）顯示出來；一旦資料準備就緒，它就會切換並將畫面上正式的內容渲染出來。

## 💪 動手做做看：解決這個問題！

為了解決路由層面上的非同步載入，我們要在整個 Vue 應用的上層環境裡加上 `<Suspense>`，通常會是在負責渲染 Router 頁面的地方。

### 步驟 1：在元件中使用頂層 await

首先，如果你打開了 `src/pages/projects/index.vue`，你會發現我們原本是使用 IIFE (立即執行函數) 來避免元件變成非同步的：

```typescript
// 舊的做法：使用 IIFE 隱藏非同步操作
;(async () => {
  await getProjects()
})()
```

現在，大膽地把它改成最乾淨的 `await` 吧！改為：

```typescript
// 新的做法：利用頂層 await，簡單明瞭！
await getProjects()
```

### 步驟 2：在 App.vue 加上 Suspense 邊界 (Boundary)

接下來，我們需要告訴 Vue，在切換路由和載入非同步資料時，如果遇到「等待過程」該如何處理。我們來到 `src/App.vue`（或是你有使用 `<RouterView>` 的地方）。

在此專案的 `src/App.vue` 中，你會做以下更改：

```vue
<script setup lang="ts"></script>

<template>
  <AuthLayout>
    <!-- 搭配 Vue Router v4 時，必須透過 v-slot 取得 Component，再進行包裹 -->
    <RouterView v-slot="{ Component, route }">
      <!-- 只有當 Component 存在時才顯示 Suspense -->
      <Suspense v-if="Component" :timeout="0">
        <!-- 正常元件顯示在這 -->
        <Component :is="Component" :key="route.name" />

        <!-- #fallback 是等待過程中要顯示的畫面，可以在這放個 Loading 轉圈圈 -->
        <template #fallback>
          <div class="p-6 text-gray-500">Loading...</div>
        </template>
      </Suspense>
    </RouterView>
  </AuthLayout>
</template>
```

### 深入解析：搭配 Vue Router 的 Suspense 語法 🔍

要了解這段代碼的運作原理，讓我們先來看看 Vue 官方文件中的兩個核心概念：**動態元件 (Dynamic Components)** 與 **Suspense**。

#### 📘 來自 Vue 官方文件的概念說明

**1. 動態元件 (Dynamic Components)**
根據 [Vue 官方文件對動態元件的說明](https://vuejs.org/guide/essentials/component-basics.html#dynamic-components)，當我們需要在同一個位置切換不同的元件時（例如頁籤切換），我們可以使用內建的 `<component>` 標籤配合 `:is` 屬性：

```vue
<!-- 當 currentTab 改變時，這裡渲染的元件也會跟著改變 -->
<component :is="tabs[currentTab]"></component>
```

`<component>` 就像是一個特殊的變形蟲佔位符（空殼），而 `:is` 綁定的值決定了它最終會變身成什麼真實的元件。

**2. Suspense 元件**
根據 [Vue 官方文件對 Suspense 的說明](https://vuejs.org/guide/built-ins/suspense.html)，`<Suspense>` 是一個內建元件，用來處理元件樹中的非同步依賴狀態。它主要擁有兩個專屬插槽：**預設插槽 (Default Slot)** 與 **備用插槽 (`#fallback`)**。

```vue
<Suspense>
  <!-- 這是預設插槽：放具有非同步任務的元件 (例如內部有 top-level await) -->
  <Dashboard />

  <!-- 這是備用插槽：等待時會顯示的載入狀態 -->
  <template #fallback>
    Loading...
  </template>
</Suspense>
```

當 `Dashboard` 的設定函數 (`setup`) 還在等待資料載入時，Vue 會先顯示 `#fallback` 裡的內容；資料載入完成後再切換回真正的 `Dashboard`。

---

#### 🛠️ 回歸專案：結合 Router 與 Suspense

現在，我們把這兩個概念套用到我們專案中 `src/App.vue` 的程式碼。讓我們一步步解析這段組合技：

**1. `v-slot` 的作用域插槽與解構 `{ Component, route }`**

普通的 `<RouterView />` 會直接幫我們把當前路由對應的頁面渲染出來。當我們加上 `v-slot`，就像是在告訴 Vue Router：「請把準備要渲染的頁面交給我，我自己決定怎麼包裝它！」

透過解構賦值 `{ Component, route }`，我們從 Vue Router 底層拿到了我們需要的東西：

- **`Component`**：這就是當前網址應該要顯示的「真正頁面元件物件」（這就等同於官方例子裡的那個 `tabs[currentTab]` 取出的元件）。
- **`route`**：包含當前路由資訊的物件（例如 `route.name`）。

**2. 召喚動態元件 `<Component>`**

這裡出現的 `<Component>` 標籤，正是官方文件提到的動態元件佔位符。
這句 `<Component :is="Component">` 的意思就是：「請把這顆變形蟲，變成 Vue Router 剛剛交給我們的那個頁面元件！」

_(注意：這裡的屬性值 `Component` 就是我們在上面 `v-slot` 取出的那個元件實體變數)_

**3. 用 `<Suspense>` 與 `#fallback` 包裹起來**

如同官方文件的範例，我們把這個動態頁面元件包進了 `<Suspense>` 裡。
當畫面切換到 `projects/index.vue` 或是 `tasks/index.vue`，而且這些頁面正在執行 `await getProjects()` 痴痴等待 Supabase 回傳資料時，Vue 會讓畫面停留在 `<template #fallback>` 裡面，也就是顯示出我們自訂的 Loading 畫面。

一旦資料就緒、Promise 解決了，Vue 就會神不知鬼不覺地把載入畫面撤掉，把完整的頁面替換上去！

這就是結合了 Vue 動態元件、Suspense 與 Vue Router，打造出流暢非同步載入體驗的高階寫法技巧！

## 🎉 總結

太棒了！你現在已經學會如何在 Vue 中使用 `<Suspense>` 處理非同步元件了！這樣一來，你不僅可以使用乾淨俐落的 Top-level `await`，也能確保你的應用程式在獲取資料時能夠優雅地呈現 Loading 狀態。

_補充：目前 Suspense 仍然是 Vue 的實驗性功能之一，但在許多專案中，它已經是一個非常強大且常被使用的工具。確保你了解 [Vue 官方文件的 Suspense 說明](https://vuejs.org/guide/built-ins/suspense.html)喔！_
