<script setup lang="ts">
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { supabase } from '@/lib/supabaseClient'
import { useAdminAuthStore } from '@/stores/adminAuth'
import type { Tables } from '../../../database/types'
import ButtonComponent from '@/components/ui/button/Button.vue'

definePage({ meta: { layout: 'admin' } })

type BookingWithMember = Tables<'bookings'> & {
  members: { display_name: string } | null
}

const adminAuth = useAdminAuthStore()
const allBookings = ref<BookingWithMember[]>([])
const isLoading = ref(true)
const statusFilter = ref('all')

const filteredBookings = computed(() => {
  if (statusFilter.value === 'all') return allBookings.value
  return allBookings.value.filter((b) => b.status === statusFilter.value)
})

async function fetchBookings() {
  isLoading.value = true
  const { data } = await supabase
    .from('bookings')
    .select('*, members(display_name)')
    .order('booking_date', { ascending: false })
  allBookings.value = (data ?? []) as BookingWithMember[]
  isLoading.value = false
}

async function confirmBooking(id: number) {
  await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
      confirmed_by: adminAuth.adminId,
    })
    .eq('id', id)
  await fetchBookings()
}

async function cancelBooking(id: number) {
  await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
  await fetchBookings()
}

const STATUS_CLASS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}
const STATUS_LABEL: Record<string, string> = {
  pending: '待確認',
  confirmed: '已確認',
  cancelled: '已取消',
}

const columns: ColumnDef<BookingWithMember>[] = [
  {
    accessorKey: 'booking_date',
    header: '預約日期',
  },
  {
    accessorKey: 'booking_time',
    header: '預約時間',
  },
  {
    id: 'member_name',
    header: '會員名稱',
    cell: ({ row }) => row.original.members?.display_name ?? '-',
  },
  {
    accessorKey: 'service',
    header: '服務項目',
  },
  {
    accessorKey: 'status',
    header: '狀態',
    cell: ({ row }) => {
      const status = row.original.status
      const cls = STATUS_CLASS[status] ?? 'bg-gray-100 text-gray-800'
      return h(
        'span',
        { class: `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}` },
        STATUS_LABEL[status] ?? status,
      )
    },
  },
  {
    accessorKey: 'notes',
    header: '備註',
    cell: ({ row }) => row.original.notes ?? '-',
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => {
      const { id, status } = row.original
      const btns = []
      if (status === 'pending') {
        btns.push(
          h(ButtonComponent, { size: 'sm', onClick: () => confirmBooking(id) }, () => '確認'),
        )
      }
      if (status !== 'cancelled') {
        btns.push(
          h(
            ButtonComponent,
            { size: 'sm', variant: 'destructive', onClick: () => cancelBooking(id) },
            () => '取消',
          ),
        )
      }
      return h('div', { class: 'flex gap-2' }, btns)
    },
  },
]

const FILTER_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待確認' },
  { value: 'confirmed', label: '已確認' },
  { value: 'cancelled', label: '已取消' },
]

onMounted(fetchBookings)
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-semibold">預約管理</h1>

    <!-- 狀態篩選 -->
    <div class="flex gap-2">
      <button
        v-for="opt in FILTER_OPTIONS"
        :key="opt.value"
        class="px-3 py-1.5 rounded-md text-sm font-medium border transition-colors"
        :class="
          statusFilter === opt.value
            ? 'bg-primary text-primary-foreground border-primary'
            : 'bg-white text-foreground border-border hover:bg-accent'
        "
        @click="statusFilter = opt.value"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- 資料表 -->
    <div v-if="isLoading" class="text-sm text-muted-foreground py-8 text-center">載入中...</div>
    <DataTable v-else :columns="columns" :data="filteredBookings" />
  </div>
</template>
