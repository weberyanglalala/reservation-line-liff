# 實作強大的資料表格：整合 TanStack Table 與 Shadcn Vue 🚀

嗨！歡迎來到這堂關於資料表格的實戰教學！👋

在現代網頁應用中，表格是呈現大量資料不可或缺的元件。但要從頭刻一個功能齊全（包含排序、過濾、分頁等）的表格可是大工程！🏗️

別擔心，今天我們會運用兩個強大的工具來幫助我們：

1.  **TanStack Table (Vue Table)**：這是表格的「大腦」🧠，負責處理所有複雜的邏輯（headless UI）。
2.  **Shadcn Vue**：這是表格的「皮膚」🎨，提供美觀且預設樣式完善的 UI 元件。

準備好了嗎？讓我們開始打造你的超級表格吧！💪

## 1. 安裝必要的套件 📦

首先，我們需要將這兩個好夥伴加入專案中。

開啟你的終端機，執行以下指令安裝 TanStack Table 的核心邏輯：

```bash
npm install @tanstack/vue-table
```

接著，使用 Shadcn Vue 的 CLI 工具快速加入表格相關的 UI 元件：

```bash
npx shadcn-vue@latest add table
```

這個指令會自動在 `src/components/ui/table` 目錄下建立一系列元件（如 `Table`, `TableHeader`, `TableRow` 等），我們稍後會直接使用它們。

## 2. 打造通用的 DataTable 元件 🧩

為了讓表格可以在專案中重複使用，我們要封裝一個 `DataTable` 元件。這個元件會接收「資料 (Data)」和「欄位定義 (Columns)」，然後幫我們渲染出來。

請建立檔案：`src/components/ui/data-table/DataTable.vue`

並貼上以下程式碼：

```vue
<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef } from '@tanstack/vue-table'
import { FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table'

// 引入我們剛剛透過 shadcn-vue 生成的 UI 元件
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

// 定義 Props：我們需要欄位定義 (columns) 和資料本身 (data)
const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}>()

// 初始化表格實體 (Table Instance)
const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel() // 使用核心列模型
})
</script>

<template>
  <div class="border rounded-md">
    <Table>
      <!-- 表頭區塊 -->
      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead v-for="header in headerGroup.headers" :key="header.id">
            <!-- FlexRender 負責渲染 header 的內容，可能是文字或元件 -->
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </TableHead>
        </TableRow>
      </TableHeader>

      <!-- 表格內容區塊 -->
      <TableBody>
        <template v-if="table.getRowModel().rows?.length">
          <TableRow
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            :data-state="row.getIsSelected() ? 'selected' : undefined"
          >
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <!-- FlexRender 負責渲染 cell 的內容 -->
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </template>

        <!-- 當沒有資料時顯示 -->
        <template v-else>
          <TableRow>
            <TableCell :colspan="columns.length" class="h-24 text-center">
              查無資料 (No results) 🕵️‍♂️
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
```

### 💡 程式碼小教室

- **Generics (`generic="TData, TValue"`)**: 這是 TypeScript 的魔法！讓我們的表格元件可以接受任何類型的資料結構，保持型別安全。
- **`FlexRender`**: 這是 TanStack Table 的核心元件。因為表格的某一格可能只是文字，也可能是一個按鈕或圖片，`FlexRender` 負責將這些定義好的內容正確地畫在畫面上。

## 3. 實戰演練：顯示任務列表 📝

現在我們有了 `DataTable` 元件，讓我們在任務頁面 (`src/pages/tasks/index.vue`) 實際使用它來顯示 Supabase 中的任務資料吧！

請參考以下範例修改你的檔案：

```vue
<script setup lang="ts">
import { supabase } from '@/lib/supabaseClient'
import { h, ref, onMounted } from 'vue'
import type { Tables } from '../../../database/types'
import type { ColumnDef } from '@tanstack/vue-table'
import DataTable from '@/components/ui/data-table/DataTable.vue'

// 定義任務資料的狀態
const tasks = ref<Tables<'tasks'>[] | null>(null)

// 取得資料的函式
const getTasks = async () => {
  const { data, error } = await supabase.from('tasks').select()
  if (error) console.log(error)
  tasks.value = data
}

// 在元件掛載時取得資料
onMounted(() => {
  getTasks()
})

// 定義表格欄位 (Columns)
const columns: ColumnDef<Tables<'tasks'>>[] = [
  {
    accessorKey: 'name', // 對應資料庫的欄位名稱
    header: () => h('div', { class: 'text-left' }, '任務名稱'),
    cell: ({ row }) => {
      // row.getValue('name') 取得該列特定欄位的值
      return h('div', { class: 'text-left font-medium text-blue-600' }, row.getValue('name'))
    }
  },
  {
    accessorKey: 'status',
    header: () => h('div', { class: 'text-left' }, '狀態'),
    cell: ({ row }) => {
      return h('div', { class: 'text-left font-medium' }, row.getValue('status'))
    }
  },
  {
    accessorKey: 'due_date',
    header: () => h('div', { class: 'text-left' }, '截止日期'),
    cell: ({ row }) => {
      return h('div', { class: 'text-left font-medium' }, row.getValue('due_date'))
    }
  },
  {
    accessorKey: 'project_id',
    header: () => h('div', { class: 'text-left' }, '專案 ID'),
    cell: ({ row }) => {
      return h('div', { class: 'text-left font-medium' }, row.getValue('project_id'))
    }
  },
  {
    accessorKey: 'collaborators',
    header: () => h('div', { class: 'text-left' }, '協作者'),
    cell: ({ row }) => {
      // 因為 collaborators 可能是陣列或物件，這裡先簡單轉成字串顯示
      return h(
        'div',
        { class: 'text-left font-medium' },
        JSON.stringify(row.getValue('collaborators'))
      )
    }
  }
]
</script>

<template>
  <div class="p-10">
    <h1 class="text-3xl font-bold mb-8">任務列表 📋</h1>
    <!-- 當資料載入完成後，顯示 DataTable -->
    <DataTable v-if="tasks" :columns="columns" :data="tasks" />
    <div v-else class="text-center">載入中... ⏳</div>
  </div>
</template>
```

## 4. 💪 動手做做看 (Challenge)

恭喜你！基本的表格已經完成了！🎉

想要更進一步嗎？試試看以下挑戰：

1.  **自定義樣式**：試著修改 `columns` 中的 `cell` 渲染函式，例如給「狀態」欄位加上不同的顏色標籤（Badge）。
2.  **加入更多欄位**：如果你的資料庫有其他欄位，試著把它們加進 `columns` 陣列中。

## 總結

透過整合 TanStack Table 和 Shadcn Vue，我們不僅省去了手刻表格的時間，還得到了一個：

- ✅ 型別安全 (Type-safe)
- ✅ 樣式美觀 (Beautiful)
- ✅ 容易擴充 (Extensible)

的強大表格解決方案。這就是現代前端開發的效率魔法！✨
