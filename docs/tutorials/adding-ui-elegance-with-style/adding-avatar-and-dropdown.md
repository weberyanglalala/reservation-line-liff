---
description: 學習如何將 Avatar（頭像）與 Dropdown Menu（下拉選單）整合到 Vue 應用程式中，打造精美的使用者導航列。
---

# 實戰演練：整合 Dropdown 與 Avatar 元件 ✨

在上一章節中，我們已經完成了 Shadcn Vue 的安裝與配置。現在，讓我們透過實作一個常見的 UI 需求——**使用者導航選單**，來體驗 Shadcn Vue 元件的強大之處。

我們將會使用到以下兩個元件：

1. **Avatar (頭像)**：用來顯示使用者的頭像圖片或名稱縮寫。
2. **Dropdown Menu (下拉選單)**：當使用者點擊頭像時，顯示即將執行的操作選單（如：個人檔案、設定、登出等）。

## 1. 安裝元件 (Installation)

首先，我們需要透過 CLI 指令將這兩個元件新增到我們的專案中。請在終端機執行以下指令：

```bash
npx shadcn-vue@latest add avatar dropdown-menu
```

這個指令會自動下載並配置 `Avatar` 與 `DropdownMenu` 相關的元件檔案到 `src/components/ui` 目錄下。

> **小提示**：如果您尚未安裝 `input` 元件，且稍後的範例程式碼中會用到搜尋框，建議您也可以一併安裝：
>
> ```bash
> npx shadcn-vue@latest add input
> ```

## 2. 更新 App.vue (Update App.vue)

接下來，我們將修改 `src/App.vue`，在頁面頂部加入一個導航列 (Navbar)。這個導航列包含一個搜尋框以及我們剛剛安裝的頭像下拉選單。

請將 `src/App.vue` 的內容更新如下：

```vue
<script setup lang="ts">
import Input from './components/ui/input/Input.vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
</script>

<template>
  <nav class="h-16 border-b bg-muted/40 flex justify-between px-6 items-center">
    <!-- 搜尋框區域 -->
    <form class="w-full max-w-96">
      <Input class="w-full pl-8 bg-background" type="text" placeholder="Search ..." />
    </form>

    <!-- 使用者下拉選單 -->
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </nav>

  <main>
    <RouterView />
  </main>
</template>
```

## 3. 程式碼解析 (Code Explanation)

讓我們來看看這段程式碼的關鍵部分：

### Dropdown Menu 結構

`DropdownMenu` 元件由幾個部分組成：

- **DropdownMenu**：最外層的容器，負責管理選單的狀態（開啟/關閉）。
- **DropdownMenuTrigger**：觸發選單開啟的元素（在這裡我們將 `Avatar` 作為觸發點）。
- **DropdownMenuContent**：選單的內容區域，包含了標籤、分隔線和選項。

### Avatar 的使用

`Avatar` 元件優雅地處理了圖片加載失敗的情況：

- **AvatarImage**：嘗試載入指定的圖片 URL。
- **AvatarFallback**：如果圖片載入失敗，則顯示設定的文字（通常是使用者名稱的縮寫）。

### 樣式說明

我們使用了 Tailwind CSS 的類別來排版：

- `bg-muted/40` 和 `bg-background`：使用 Shadcn 定義的語意化顏色變數，確保在深色模式下也能完美呈現。
- `flex justify-between items-center`：使用 Flexbox 讓搜尋框和頭像分別靠左和靠右對齊。

## 結語

恭喜！您已經成功整合了 Avatar 與 Dropdown Menu 元件。這展示了 Shadcn Vue 的一大優勢：**組合性 (Composability)**。您可以輕鬆地將不同的元件組合在一起（如將 Avatar 放入 DropdownTrigger），構建出複雜且互動性強的 UI。
