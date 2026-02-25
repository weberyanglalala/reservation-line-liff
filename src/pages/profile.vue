<script setup lang="ts">
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/auth'
import type { Tables } from '../../database/types'

const auth = useAuthStore()
const router = useRouter()

if (!auth.isLoggedIn || !auth.isRegistered) {
  router.replace('/')
}

type Booking = Tables<'bookings'>
type OptometryReport = Tables<'optometry_reports'>

const activeTab = ref<'bookings' | 'reports'>('bookings')
const bookings = ref<Booking[]>([])
const reports = ref<OptometryReport[]>([])
const isLoadingBookings = ref(false)
const isLoadingReports = ref(false)

const STATUS_CLASS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}
const STATUS_LABEL: Record<string, string> = {
  pending: '待確認',
  confirmed: '已確認',
  cancelled: '已取消',
}

async function fetchBookings() {
  if (!auth.member) return
  isLoadingBookings.value = true
  const { data } = await supabase
    .from('bookings')
    .select('*')
    .eq('member_id', auth.member.id)
    .order('booking_date', { ascending: false })
  bookings.value = data ?? []
  isLoadingBookings.value = false
}

async function fetchReports() {
  if (!auth.member) return
  isLoadingReports.value = true
  const { data } = await supabase
    .from('optometry_reports')
    .select('*')
    .eq('member_id', auth.member.id)
    .order('created_at', { ascending: false })
  reports.value = data ?? []
  isLoadingReports.value = false
}

function switchTab(tab: 'bookings' | 'reports') {
  activeTab.value = tab
  if (tab === 'bookings' && bookings.value.length === 0) fetchBookings()
  if (tab === 'reports' && reports.value.length === 0) fetchReports()
}

function formatOptVal(val: number | null, decimals = 2): string {
  return val === null ? '—' : (val >= 0 ? '+' : '') + val.toFixed(decimals)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

onMounted(fetchBookings)
</script>

<template>
  <div class="flex flex-col gap-6 p-4 max-w-sm mx-auto pt-10 pb-16">
    <!-- 會員資訊卡 -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center gap-3">
      <img
        v-if="auth.lineProfile?.pictureUrl"
        :src="auth.lineProfile.pictureUrl"
        :alt="auth.lineProfile.displayName"
        class="w-20 h-20 rounded-full object-cover"
      />
      <div
        v-else
        class="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="text-center">
        <h1 class="text-xl font-bold text-slate-800">{{ auth.member?.display_name }}</h1>
        <p class="text-xs text-slate-400 mt-0.5">LINE ID：{{ auth.member?.line_id }}</p>
        <p class="text-xs text-slate-400">
          加入日期：{{ new Date(auth.member!.created_at).toLocaleDateString('zh-TW') }}
        </p>
      </div>
      <Button class="w-full mt-1" @click="router.push('/booking')">立即預約</Button>
    </div>

    <!-- Tab 切換 -->
    <div class="flex rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
      <button
        class="flex-1 py-2.5 text-sm font-medium transition-colors"
        :class="activeTab === 'bookings' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'"
        @click="switchTab('bookings')"
      >
        我的預約
      </button>
      <button
        class="flex-1 py-2.5 text-sm font-medium transition-colors"
        :class="activeTab === 'reports' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'"
        @click="switchTab('reports')"
      >
        驗光報告
      </button>
    </div>

    <!-- 預約列表 -->
    <template v-if="activeTab === 'bookings'">
      <div v-if="isLoadingBookings" class="text-center text-sm text-slate-400 py-10">載入中...</div>
      <div v-else-if="bookings.length === 0" class="text-center text-sm text-slate-400 py-10">
        尚無預約紀錄
      </div>
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="booking in bookings"
          :key="booking.id"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-semibold text-slate-700">{{ booking.service }}</p>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ booking.booking_date }} {{ booking.booking_time }}
              </p>
            </div>
            <span
              class="text-xs font-medium px-2.5 py-1 rounded-full"
              :class="STATUS_CLASS[booking.status] ?? 'bg-slate-100 text-slate-600'"
            >
              {{ STATUS_LABEL[booking.status] ?? booking.status }}
            </span>
          </div>
          <p v-if="booking.notes" class="text-xs text-slate-500 border-t border-slate-100 pt-2">
            {{ booking.notes }}
          </p>
        </div>
      </div>
    </template>

    <!-- 驗光報告列表 -->
    <template v-if="activeTab === 'reports'">
      <div v-if="isLoadingReports" class="text-center text-sm text-slate-400 py-10">載入中...</div>
      <div v-else-if="reports.length === 0" class="text-center text-sm text-slate-400 py-10">
        尚無驗光報告
      </div>
      <div v-else class="flex flex-col gap-4">
        <div
          v-for="report in reports"
          :key="report.id"
          class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <!-- 報告標頭 -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-5 bg-blue-500 rounded-full"></span>
              <p class="text-sm font-semibold text-slate-700">{{ formatDate(report.created_at) }}</p>
            </div>
            <span
              v-if="report.is_final_prescription"
              class="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-700"
            >
              最終處方
            </span>
            <span v-else class="text-xs text-slate-400">草稿</span>
          </div>

          <!-- 驗光數據表格 -->
          <div class="p-4 overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-xs text-slate-400 border-b border-slate-100">
                  <th class="text-left font-medium pb-2 pr-3">眼別</th>
                  <th class="text-center font-medium pb-2 px-2">SPH</th>
                  <th class="text-center font-medium pb-2 px-2">CYL</th>
                  <th class="text-center font-medium pb-2 px-2">AXIS</th>
                  <th class="text-center font-medium pb-2 pl-2">VA</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-slate-50">
                  <td class="py-2.5 pr-3 font-semibold text-blue-600 text-xs whitespace-nowrap">右眼 OD</td>
                  <td class="py-2.5 px-2 text-center font-mono text-xs tabular-nums">{{ formatOptVal(report.od_sphere) }}</td>
                  <td class="py-2.5 px-2 text-center font-mono text-xs tabular-nums">{{ formatOptVal(report.od_cylinder) }}</td>
                  <td class="py-2.5 px-2 text-center font-mono text-xs tabular-nums">{{ report.od_axis != null ? report.od_axis + '°' : '—' }}</td>
                  <td class="py-2.5 pl-2 text-center">
                    <span v-if="report.od_va" class="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">
                      {{ report.od_va }}
                    </span>
                    <span v-else class="text-slate-300 text-xs">—</span>
                  </td>
                </tr>
                <tr>
                  <td class="py-2.5 pr-3 font-semibold text-pink-600 text-xs whitespace-nowrap">左眼 OS</td>
                  <td class="py-2.5 px-2 text-center font-mono text-xs tabular-nums">{{ formatOptVal(report.os_sphere) }}</td>
                  <td class="py-2.5 px-2 text-center font-mono text-xs tabular-nums">{{ formatOptVal(report.os_cylinder) }}</td>
                  <td class="py-2.5 px-2 text-center font-mono text-xs tabular-nums">{{ report.os_axis != null ? report.os_axis + '°' : '—' }}</td>
                  <td class="py-2.5 pl-2 text-center">
                    <span v-if="report.os_va" class="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">
                      {{ report.os_va }}
                    </span>
                    <span v-else class="text-slate-300 text-xs">—</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- PD / ADD -->
            <div
              v-if="report.pd != null || report.add_power != null"
              class="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500"
            >
              <span v-if="report.pd != null">
                瞳距 PD：<span class="font-semibold text-slate-700 tabular-nums">{{ report.pd }} mm</span>
              </span>
              <span v-if="report.add_power != null">
                加入度 ADD：<span class="font-semibold text-slate-700 tabular-nums">{{ formatOptVal(report.add_power) }}</span>
              </span>
            </div>

            <!-- 備註 -->
            <p v-if="report.remarks" class="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 italic leading-relaxed">
              "{{ report.remarks }}"
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
