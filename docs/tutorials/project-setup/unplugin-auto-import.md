---
description: 學習如何設定 unplugin-auto-import 實現 Vue 與 Vue Router API 的自動匯入，並整合 TypeScript 提升開發效率。
---

# 提升開發效率的神器：unplugin-auto-import 🚀

哈囉！身為一位 Vue 開發者，你是不是常常在每個 `.vue` 檔案的最前面寫著 `import { ref, computed } from 'vue'` 或是 `import { useRoute, useRouter } from 'vue-router'` 呢？如果專案有很多檔案，這將會變成一件非常繁瑣的重複性工作 😵‍💫。

別擔心！今天我們要來探索一個超讚的開發神器：[unplugin-auto-import](https://github.com/unplugin/unplugin-auto-import)。它可以幫我們**自動匯入**常用的 API，讓你寫扣時能夠專注在邏輯本身，而不是一直複製貼上 `import` 語句！🎉

---

## 為什麼需要自動匯入？ 💡

想像一下，如果我們每次使用 `ref` 或 `useRouter` 都可以直接拿來用，而不必先 `import`，程式碼會變得多簡潔呀！

- **省時省力**：減少重複撰寫 `import` 語句。
- **畫面更乾淨**：元件頂端的程式碼會大幅減少，可讀性提升。
- **開發體驗極佳**：隨寫隨用，心流不中斷 💪。

準備好了嗎？讓我們開始動手設定吧！

---

## 🛠️ 第一步：安裝套件

首先，我們需要將 `unplugin-auto-import` 加到我們的專案依賴中：

```bash
npm i -D unplugin-auto-import
```

這項工具是在開發階段幫助我們的，所以我們將它安裝為 `devDependency` (-D)。

---

## ⚙️ 第二步：設定 Vite `vite.config.ts`

安裝完成後，我們要修改 Vite 的設定檔，把這個外掛註冊進去。它不僅支援 Vue，也支援 Vue Router 等常用函式庫哦！

請開啟 `vite.config.ts` 並參考以下設定：

```typescript
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite' // 引入外掛

export default defineConfig({
  plugins: [
    // 註冊 unplugin-auto-import 外掛
    AutoImport({
      // 告訴外掛哪些檔案需要自動匯入功能
      include: [
        /\.[tj]sx?$/, // 支援 .ts, .tsx, .js, .jsx
        /\.vue$/, // 支援 .vue
        /\.vue\?vue/,
        /\.md$/ // 支援 markdown
      ],
      // 預設要幫我們匯入哪些函式庫的 API
      imports: [
        'vue', // 例如 ref, computed, watch, ...
        'vue-router' // 例如 useRouter, useRoute, ...
      ],
      // 外掛會自動生成這個 TypeScript 定義檔
      dts: './auto-imports.d.ts',
      viteOptimizeDeps: true
    }),
    vue()
    // ... 其他外掛
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

一旦儲存並啟動專案（`npm run dev`），外掛會掃描你的程式碼，並在專案根目錄自動產生一個名叫 `auto-imports.d.ts` 的檔案。這個檔案其實就是用來告訴編輯器：「嘿，這些 API 其實已經存在囉！」✨

---

## 📐 第三步：設定 TypeScript `tsconfig.app.json`

雖然我們已經在 Vite 設定好了，並且產生了 `auto-imports.d.ts`，但如果我們使用的是 TypeScript，它可能會抱怨找不到 `ref` 或 `computed` 的定義（因為我們不再手動 `import` 它們了）。

為了讓 TypeScript 也能了解這項黑魔法，我們需要修改 `tsconfig.app.json`，把剛剛自動產生的宣告檔加進 `include` 中：

```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": [
    "env.d.ts",
    "src/**/*",
    "src/**/*.vue",
    // 在這裡加入自動產生的型別定義檔 👇
    "auto-imports.d.ts"
  ],
  "exclude": ["src/**/__tests__/*"],
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    },
    "baseUrl": "."
  }
}
```

加好之後，你會發現本來報錯的地方瞬間變得一片祥和！TypeScript 現在正確地認識自動匯入的 API 了 🙌。

---

## 💪 動手做做看：享受自動匯入的便利！

現在你可以在你的組件裡試試看了。把原本的 `import { ref, computed } from 'vue'` 刪除，然後直接這樣寫：

```vue
<script setup lang="ts">
// 哇塞，完全不需要 import 任何東西就能直接用了！🤩
const count = ref(0)
const doubleCount = computed(() => count.value * 2)

const route = useRoute()
console.log('當前路由是：', route.path)
</script>

<template>
  <div>
    <p>目前的計數：{{ count }}</p>
    <p>雙倍的計數：{{ doubleCount }}</p>
    <button @click="count++">增加</button>
  </div>
</template>
```

是不是超清爽呀？祝你開發愉快！🎈
