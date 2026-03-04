<script setup lang="ts">
import { ArrowUp, ArrowDown, Search, Pencil } from 'lucide-vue-next'
import { supabase } from '@/lib/supabaseClient'
import type { Tables } from '../../../database/types'

definePage({ meta: { layout: 'admin' } })

type LineNotification = Tables<'line_notifications'>

const page = ref(0)
const PAGE_SIZE = 10
const notifications = ref<LineNotification[]>([])
const total = ref(0)
const isLoading = ref(true)

const totalPages = computed(() => Math.ceil(total.value / PAGE_SIZE))

const search = ref('')
const filterStatus = ref('')
const sortAsc = ref(false)

async function fetchNotifications() {
  isLoading.value = true

  let query = supabase
    .from('line_notifications')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: sortAsc.value })
    .range(page.value * PAGE_SIZE, (page.value + 1) * PAGE_SIZE - 1)

  if (search.value.trim()) {
    query = query.ilike('line_user_id', `%${search.value.trim()}%`)
  }

  if (filterStatus.value) {
    query = query.eq('status', filterStatus.value)
  }

  const { data, count } = await query
  notifications.value = (data ?? []) as LineNotification[]
  total.value = count ?? 0
  isLoading.value = false
}

let searchTimer: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimer)
  page.value = 0
  searchTimer = setTimeout(fetchNotifications, 300)
})

watch([page, sortAsc, filterStatus], fetchNotifications)

function toggleSort() {
  sortAsc.value = !sortAsc.value
  page.value = 0
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(fetchNotifications)

// --- 編輯 Dialog ---
const editDialogOpen = ref(false)
const editingRow = ref<LineNotification | null>(null)
const editForm = ref({ message: '', status: '', scheduled_at: '' })
const isEditSubmitting = ref(false)
const editSubmitError = ref('')

function toDatetimeLocal(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function openEditDialog(row: LineNotification) {
  editingRow.value = row
  editForm.value = {
    message: row.message,
    status: row.status,
    scheduled_at: toDatetimeLocal(row.scheduled_at),
  }
  editSubmitError.value = ''
  editDialogOpen.value = true
}

async function submitEdit() {
  if (!editingRow.value) return
  isEditSubmitting.value = true
  editSubmitError.value = ''

  const { error } = await supabase
    .from('line_notifications')
    .update({
      message: editForm.value.message,
      status: editForm.value.status,
      scheduled_at: editForm.value.scheduled_at || null,
    })
    .eq('id', editingRow.value.id)

  isEditSubmitting.value = false

  if (error) {
    editSubmitError.value = error.message
    return
  }

  editDialogOpen.value = false
  fetchNotifications()
}

const statusOptions = [
  { value: 'pending', label: '待發送' },
  { value: 'sent', label: '已發送' },
  { value: 'failed', label: '失敗' },
  { value: 'cancelled', label: '已取消' },
]

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'pending': return 'inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 font-medium text-xs'
    case 'sent': return 'inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-green-700 font-medium text-xs'
    case 'failed': return 'inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-red-700 font-medium text-xs'
    case 'cancelled': return 'inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 font-medium text-xs'
    default: return 'inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-gray-600 font-medium text-xs'
  }
}

function statusLabel(status: string): string {
  return statusOptions.find(o => o.value === status)?.label ?? status
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-semibold">LINE 通知管理</h1>

    <!-- 篩選列 -->
    <div class="flex items-center gap-3 flex-wrap">
      <div class="relative max-w-xs flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input v-model="search" placeholder="搜尋 LINE User ID..." class="pl-9" />
      </div>
      <select
        v-model="filterStatus"
        class="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        @change="() => { page = 0; fetchNotifications() }"
      >
        <option value="">全部狀態</option>
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- 資料表 -->
    <div class="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-14">ID</TableHead>
            <TableHead>LINE User ID</TableHead>
            <TableHead>訊息內容</TableHead>
            <TableHead>狀態</TableHead>
            <TableHead>排程時間</TableHead>
            <TableHead>發送時間</TableHead>
            <TableHead>
              <button class="flex items-center gap-1 font-medium hover:text-foreground" @click="toggleSort">
                建立時間
                <ArrowUp v-if="sortAsc" class="h-4 w-4" />
                <ArrowDown v-else class="h-4 w-4" />
              </button>
            </TableHead>
            <TableHead class="w-16 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="isLoading">
            <TableRow>
              <TableCell :colspan="8" class="h-24 text-center text-muted-foreground">
                載入中...
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="notifications.length">
            <TableRow v-for="row in notifications" :key="row.id">
              <TableCell class="text-sm">{{ row.id }}</TableCell>
              <TableCell class="font-mono text-xs">{{ row.line_user_id }}</TableCell>
              <TableCell class="text-sm max-w-xs">
                <span :title="row.message">
                  {{ row.message.length > 30 ? row.message.slice(0, 30) + '...' : row.message }}
                </span>
              </TableCell>
              <TableCell>
                <span :class="statusBadgeClass(row.status)">{{ statusLabel(row.status) }}</span>
              </TableCell>
              <TableCell class="text-sm text-muted-foreground whitespace-nowrap">
                {{ row.scheduled_at ? formatDate(row.scheduled_at) : '立即' }}
              </TableCell>
              <TableCell class="text-sm text-muted-foreground whitespace-nowrap">
                {{ formatDate(row.send_at) }}
              </TableCell>
              <TableCell class="text-sm text-muted-foreground whitespace-nowrap">
                {{ formatDate(row.created_at) }}
              </TableCell>
              <TableCell class="text-right">
                <Button variant="ghost" size="sm" @click="openEditDialog(row)">
                  <Pencil class="h-4 w-4" />
                  <span class="sr-only">編輯</span>
                </Button>
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell :colspan="8" class="h-24 text-center text-muted-foreground">
                沒有符合的通知記錄
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- 分頁 -->
    <div class="flex items-center justify-between text-sm text-muted-foreground">
      <span>共 {{ total }} 筆通知</span>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" :disabled="page === 0" @click="page--">
          上一頁
        </Button>
        <span class="tabular-nums">{{ page + 1 }} / {{ totalPages || 1 }}</span>
        <Button variant="outline" size="sm" :disabled="page >= totalPages - 1" @click="page++">
          下一頁
        </Button>
      </div>
    </div>
  </div>

  <!-- 編輯 Dialog -->
  <Dialog v-model:open="editDialogOpen">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>編輯通知記錄</DialogTitle>
        <DialogDescription v-if="editingRow">
          ID: {{ editingRow.id }} — {{ editingRow.line_user_id }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="submitEdit">
        <div class="space-y-1">
          <Label for="edit-message">訊息內容</Label>
          <textarea
            id="edit-message"
            v-model="editForm.message"
            rows="5"
            required
            class="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>

        <div class="space-y-1">
          <Label for="edit-status">狀態</Label>
          <select
            id="edit-status"
            v-model="editForm.status"
            class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div class="space-y-1">
          <Label for="edit-scheduled-at">排程時間（選填，留空代表立即）</Label>
          <input
            id="edit-scheduled-at"
            v-model="editForm.scheduled_at"
            type="datetime-local"
            class="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <p v-if="editSubmitError" class="text-sm text-destructive">{{ editSubmitError }}</p>

        <DialogFooter>
          <Button type="button" variant="outline" @click="editDialogOpen = false">取消</Button>
          <Button type="submit" :disabled="isEditSubmitting">
            {{ isEditSubmitting ? '儲存中...' : '儲存變更' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
