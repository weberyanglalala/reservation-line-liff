---
description: 介紹 Shadcn Vue 並將其配置到專案中，快速構建精美的元件。
---

# 探索 Shadcn Vue：打造優雅的 UI 介面 ✨

## 簡介 (Introduction)

Shadcn Vue 是一個快速構建強大 Vue 應用程式的絕佳選擇。它提供了一組可重用的組件，我們可以將其複製並粘貼到我們的應用程序中。在本課程中，我們將向您介紹 Shadcn-vue 並在我們的專案中進行配置。

## 安裝與配置 (Installation & Configuration)

我們將遵循 Shadcn Vue 官方的 Vite 安裝指南來設定開發環境。

### 1. 建立專案與安裝依賴 (Create Project & Install Dependencies)

如果您還沒有專案，可以使用以下指令建立一個新的 Vite 專案（包含 TypeScript）：

```bash
npm create vite@latest my-vue-app -- --template vue-ts
```

接下來，我們使用最新版本的 Tailwind CSS v4 與 Reactivity Transform（如果適用）：

```bash
npm install -D tailwindcss @tailwindcss/vite
```

### 2. 配置 Vite 與路徑別名 (Configure Vite & Path Alias)

為了讓引用更加方便，我們需要在 `tsconfig.json` 或 `tsconfig.app.json` 中配置路徑別名 (`@/*`)：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

更新 `vite.config.ts` 以引入 Tailwind CSS 插件並支援別名解析：

```typescript
import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### 3. 配置全域樣式 (Global Styles)

在 `src/style.css` 中引入 Tailwind CSS：

```css
@import 'tailwindcss';
```

### 4. 初始化 Shadcn Vue (Initialize Shadcn Vue)

現在，我們可以執行初始化指令來自動配置專案。這不僅會設定 `components.json`，還會根據我們選擇的主題自動調整 CSS 變數。

```bash
npx shadcn-vue@latest init
```

執行過程中，CLI 會詢問幾個問題，以下是我們專案 (`vuejs-masterclass-2024`) 的配置參考：

- **Would you like to use TypeScript?** -> **yes**
- **Which framework are you using?** -> **Vite**
- **Which style would you like to use?** -> **New York**
- **Which color would you like to use as base color?** -> **Slate**
- **Where is your global CSS file?** -> **src/style.css**
- **Do you want to use CSS variables for colors?** -> **yes**
- **Where is your tailwind.config.js located?** -> **(Leave empty if using v4)**
- **Configure the import alias for components:** -> **@/components**
- **Configure the import alias for utils:** -> **@/lib/utils**
- **Write configuration to components.json.** -> **yes**

完成後，專案根目錄會生成 `components.json` 檔案。

## 使用元件 (Using Components)

Shadcn Vue 的核心優勢在於您可以按需引入元件。例如，如果我們想要使用按鈕 (Button)，只需執行：

```bash
npx shadcn-vue@latest add button
```

這將會把 Button 元件的原始碼下載到 `src/components/ui/button` 目錄中。

### 在頁面中使用 (Usage Example)

您可以在任何 Vue 頁面中直接引用並使用它：

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class="p-4">
    <Button variant="default">點擊我 🚀</Button>
    <Button variant="outline" class="ml-2">更多選項</Button>
  </div>
</template>
```

## 結語 (Conclusion)

透過 Shadcn Vue，我們不僅獲得了美觀的預設樣式，還擁有了完整的程式碼控制權。這讓我們的 UI 開發既快速又靈活！接下來的課程中，我們將學習如何運用更多 Shadcn 元件來豐富我們的應用程式。
