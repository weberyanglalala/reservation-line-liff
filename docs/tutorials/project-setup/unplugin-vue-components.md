---
description: 學習如何在 Vite 專案中設定 unplugin-vue-components，實現自動匯入自定義與 UI 元件，提升開發效率。
---

# 釋放雙手：使用 unplugin-vue-components 實現 Vue 元件自動匯入 🪄

在開發 Vue 專案時，你是否厭倦了每次使用元件都要手動寫一遍 `import ... from ...` 呢？這不僅繁瑣，還容易讓程式碼頂部變得雜亂無章與難以維護。

今天我們要來介紹一個神奇的套件：**`unplugin-vue-components`**！它就像是你專屬的元件搬運工 🚚，當你在模板中使用任何自己封裝或是第三方的組件時，它會自動幫你找到並在背景悄悄匯入它，讓你完全放心地專注於畫面開發。

## 為什麼需要自動匯入？ 🤔

想像一下，如果你有很多 UI 元件或是自定義的共用元件，你的純手工程式碼可能會長這樣：

```vue
<script setup>
import Table from '@/components/ui/table/Table.vue'
import TableHeader from '@/components/ui/table/TableHeader.vue'
import TableRow from '@/components/ui/table/TableRow.vue'
// ... 還有更多需要宣告的元件 ...
</script>
```

有了 `unplugin-vue-components`，上面這些代碼全都不需要自己手寫了！ 🎉

## 安裝與設定步驟 🛠️

在我們的 Vite 專案中，這項魔法的設定非常簡單直觀。

### 1. 確認套件安裝

在我們的 `package.json` 中，已經確認將其安裝設定為開發依賴 (`devDependencies`)：

```json
{
  "devDependencies": {
    "unplugin-vue-components": "^31.0.0"
  }
}
```

### 2. 設定 Vite 配置檔

接下來，我們要在 Vite 的配置檔中啟用這個插件。翻開 `vite.config.ts`：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 1. 匯入 Components 插件
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    // 2. 將 Components 加入外掛陣列中
    Components({
      /* 這裡可以放自定義選項（例如自訂目錄、解析器等） */
    })
  ]
})
```

就這麼簡單！啟動開發伺服器後，插件會自動掃描並在專案目錄（預設為 `src/components`）中聰明地尋找元件。更棒的是，它還會自動幫我們生成 `components.d.ts` 讓 TypeScript 提供完整的型別支援檢查功能唷！

## 實際成果：乾淨清爽的程式碼 🌟

讓我們來看看實際應用。打開 `src/components/ui/data-table/DataTable.vue`，你會發現我們在裡面使用了各種表格元件，卻 **不需要寫任何元件的 import 語句**：

```vue
<template>
  <div class="border rounded-md">
    <!-- 這個 Table 元件會自動被匯入！ -->
    <Table>
      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <!-- 內部的 TableHead 與 TableRow 元件也全都是自動精準匹配匯入的 -->
          <TableHead v-for="header in headerGroup.headers" :key="header.id">
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="table.getRowModel().rows?.length">
          <TableRow
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            :data-state="row.getIsSelected() ? 'selected' : undefined"
          >
            <!-- TableCell 也能無縫呼叫使用！ -->
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
```

在這個檔案裡，`Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell` 都是透過 `unplugin-vue-components` 的魔法自動解析出來的。這讓我們的程式碼變得更專注於視圖邏輯本身，而不是無止盡的匯入聲明與管理。

## 💪 動手做做看

現在就試著在你的專案資料夾建立一個新的測試元件！直接切換到 `src/pages/index.vue` 頁面中使用它，不撰寫任何 `import` 程式碼，看看元件是不是也神奇地出現在畫面上呢？趕快動手試看看這個自動化的魔法吧！🚀
