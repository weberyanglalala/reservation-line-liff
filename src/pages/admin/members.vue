<script setup lang="ts">
import { ArrowUp, ArrowDown, Search, FilePlus, ChevronDown, ChevronUp, ScanLine, ImageUp, X, Pencil, Bell } from 'lucide-vue-next'
import { supabase } from '@/lib/supabaseClient'
import type { Tables } from '../../../database/types'
import { useOptometryOCR } from '@/composables/useOptometryOCR'

definePage({ meta: { layout: 'admin' } })

type Member = Tables<'members'>

const search = ref('')
const page = ref(0)
const PAGE_SIZE = 10
const sortAsc = ref(false)
const members = ref<Member[]>([])
const total = ref(0)
const isLoading = ref(true)

const totalPages = computed(() => Math.ceil(total.value / PAGE_SIZE))

async function fetchMembers() {
  isLoading.value = true

  let query = supabase
    .from('members')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: sortAsc.value })
    .range(page.value * PAGE_SIZE, (page.value + 1) * PAGE_SIZE - 1)

  if (search.value.trim()) {
    const s = search.value.trim()
    query = query.or(`line_id.ilike.%${s}%,display_name.ilike.%${s}%`)
  }

  const { data, count } = await query
  members.value = (data ?? []) as Member[]
  total.value = count ?? 0
  isLoading.value = false
}

let searchTimer: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimer)
  page.value = 0
  searchTimer = setTimeout(fetchMembers, 300)
})

watch([page, sortAsc], fetchMembers)

function toggleSort() {
  sortAsc.value = !sortAsc.value
  page.value = 0
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(fetchMembers)

// --- 展開驗光報告 ---
type OptometryReport = Tables<'optometry_reports'>

const expandedMemberId = ref<number | null>(null)
const reportsCache = ref<Record<number, OptometryReport[]>>({})
const reportsLoading = ref<Record<number, boolean>>({})

async function toggleReports(memberId: number) {
  if (expandedMemberId.value === memberId) {
    expandedMemberId.value = null
    return
  }
  expandedMemberId.value = memberId
  if (!reportsCache.value[memberId]) {
    reportsLoading.value = { ...reportsLoading.value, [memberId]: true }
    const { data } = await supabase
      .from('optometry_reports')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
    reportsCache.value = { ...reportsCache.value, [memberId]: data ?? [] }
    const next = { ...reportsLoading.value }
    delete next[memberId]
    reportsLoading.value = next
  }
}

function formatOptVal(val: number | null, decimals = 2): string {
  return val === null ? '—' : val.toFixed(decimals)
}

// --- 新增驗光報告 Modal ---
const dialogOpen = ref(false)
const selectedMember = ref<Member | null>(null)
const isSubmitting = ref(false)
const submitError = ref('')

interface FormRaw {
  od_sphere: string
  od_cylinder: string
  od_axis: string
  od_va: string
  os_sphere: string
  os_cylinder: string
  os_axis: string
  os_va: string
  pd: string
  add_power: string
  is_final_prescription: boolean
  remarks: string
}

function emptyForm(): FormRaw {
  return {
    od_sphere: '',
    od_cylinder: '',
    od_axis: '',
    od_va: '',
    os_sphere: '',
    os_cylinder: '',
    os_axis: '',
    os_va: '',
    pd: '',
    add_power: '',
    is_final_prescription: false,
    remarks: '',
  }
}

const form = ref<FormRaw>(emptyForm())

// --- OCR ---
const { isProcessing: isOcrProcessing, ocrError, analyzeImage } = useOptometryOCR()
const ocrImageFile = ref<File | null>(null)
const ocrImageUrl = ref('')
const ocrSuccess = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
  fileInputRef.value?.click()
}

async function handleOcrFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  ocrImageFile.value = file
  ocrImageUrl.value = URL.createObjectURL(file)
  ocrSuccess.value = false
  await runOcr()
}

function clearOcrImage() {
  ocrImageFile.value = null
  if (ocrImageUrl.value) URL.revokeObjectURL(ocrImageUrl.value)
  ocrImageUrl.value = ''
  ocrSuccess.value = false
  if (fileInputRef.value) fileInputRef.value.value = ''
}

async function runOcr() {
  if (!ocrImageFile.value) return
  const result = await analyzeImage(ocrImageFile.value)
  if (!result) return
  // Merge only non-empty values into form
  const keys = ['od_sphere', 'od_cylinder', 'od_axis', 'od_va', 'os_sphere', 'os_cylinder', 'os_axis', 'os_va', 'pd', 'add_power', 'remarks'] as const
  for (const key of keys) {
    if (result[key] !== '') {
      (form.value as Record<string, unknown>)[key] = result[key]
    }
  }
  ocrSuccess.value = true
}

function openDialog(member: Member) {
  selectedMember.value = member
  form.value = emptyForm()
  submitError.value = ''
  clearOcrImage()
  ocrError.value = ''
  dialogOpen.value = true
}

function toDecimal(s: string): number | null {
  const n = parseFloat(s)
  return isNaN(n) ? null : n
}

function toInt(s: string): number | null {
  const n = parseInt(s, 10)
  return isNaN(n) ? null : n
}

async function submitReport() {
  if (!selectedMember.value) return
  isSubmitting.value = true
  submitError.value = ''

  const { error } = await supabase.from('optometry_reports').insert({
    member_id: selectedMember.value.id,
    od_sphere: toDecimal(form.value.od_sphere),
    od_cylinder: toDecimal(form.value.od_cylinder),
    od_axis: toInt(form.value.od_axis),
    od_va: form.value.od_va || null,
    os_sphere: toDecimal(form.value.os_sphere),
    os_cylinder: toDecimal(form.value.os_cylinder),
    os_axis: toInt(form.value.os_axis),
    os_va: form.value.os_va || null,
    pd: toDecimal(form.value.pd),
    add_power: toDecimal(form.value.add_power),
    is_final_prescription: form.value.is_final_prescription,
    remarks: form.value.remarks || null,
  })

  isSubmitting.value = false

  if (error) {
    submitError.value = error.message
    return
  }

  dialogOpen.value = false

  // 若該會員報告列表正在展開，清快取並重新載入
  const mid = selectedMember.value.id
  if (expandedMemberId.value === mid) {
    const next = { ...reportsCache.value }
    delete next[mid]
    reportsCache.value = next
    await toggleReports(mid)
  }
}

// --- LINE 通知 Dialog ---
const notifyDialogOpen = ref(false)
const notifyReport = ref<OptometryReport | null>(null)
const notifyMember = ref<Member | null>(null)
const notifyForm = ref({ message: '', scheduled_at: '' })
const isNotifySubmitting = ref(false)
const notifySubmitError = ref('')

function twoMinutesLater(): string {
  const d = new Date(Date.now() + 2 * 60 * 1000)
  // datetime-local 需要 "YYYY-MM-DDTHH:mm" 格式（local time）
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function openNotifyDialog(report: OptometryReport, member: Member) {
  notifyReport.value = report
  notifyMember.value = member
  notifyForm.value = {
    message: `親愛的 ${member.display_name} 您好，\n您的驗光報告（最終處方）已完成，請至門市取件或洽詢相關事宜。\n感謝您的光臨！`,
    scheduled_at: twoMinutesLater(),
  }
  notifySubmitError.value = ''
  notifyDialogOpen.value = true
}

async function submitNotification() {
  if (!notifyReport.value || !notifyMember.value) return
  isNotifySubmitting.value = true
  notifySubmitError.value = ''

  const { error } = await supabase.from('line_notifications').insert({
    line_user_id: notifyMember.value.line_id,
    message: notifyForm.value.message,
    scheduled_at: notifyForm.value.scheduled_at || null,
    optometry_report_id: notifyReport.value.id,
    status: 'pending',
  })

  isNotifySubmitting.value = false

  if (error) {
    notifySubmitError.value = error.message
    return
  }

  notifyDialogOpen.value = false
}

// --- 編輯 Dialog ---
const editDialogOpen = ref(false)
const editingReport = ref<OptometryReport | null>(null)
const editForm = ref<FormRaw>(emptyForm())
const isEditSubmitting = ref(false)
const editSubmitError = ref('')

function openEditDialog(report: OptometryReport) {
  editingReport.value = report
  editForm.value = {
    od_sphere:            report.od_sphere    != null ? String(report.od_sphere)    : '',
    od_cylinder:          report.od_cylinder  != null ? String(report.od_cylinder)  : '',
    od_axis:              report.od_axis      != null ? String(report.od_axis)      : '',
    od_va:                report.od_va        ?? '',
    os_sphere:            report.os_sphere    != null ? String(report.os_sphere)    : '',
    os_cylinder:          report.os_cylinder  != null ? String(report.os_cylinder)  : '',
    os_axis:              report.os_axis      != null ? String(report.os_axis)      : '',
    os_va:                report.os_va        ?? '',
    pd:                   report.pd           != null ? String(report.pd)           : '',
    add_power:            report.add_power    != null ? String(report.add_power)    : '',
    is_final_prescription: report.is_final_prescription ?? false,
    remarks:              report.remarks      ?? '',
  }
  editSubmitError.value = ''
  editDialogOpen.value = true
}

async function submitEditReport() {
  if (!editingReport.value) return
  isEditSubmitting.value = true
  editSubmitError.value = ''

  const { error } = await supabase
    .from('optometry_reports')
    .update({
      od_sphere:             toDecimal(editForm.value.od_sphere),
      od_cylinder:           toDecimal(editForm.value.od_cylinder),
      od_axis:               toInt(editForm.value.od_axis),
      od_va:                 editForm.value.od_va || null,
      os_sphere:             toDecimal(editForm.value.os_sphere),
      os_cylinder:           toDecimal(editForm.value.os_cylinder),
      os_axis:               toInt(editForm.value.os_axis),
      os_va:                 editForm.value.os_va || null,
      pd:                    toDecimal(editForm.value.pd),
      add_power:             toDecimal(editForm.value.add_power),
      is_final_prescription: editForm.value.is_final_prescription,
      remarks:               editForm.value.remarks || null,
    })
    .eq('id', editingReport.value.id)

  isEditSubmitting.value = false

  if (error) {
    editSubmitError.value = error.message
    return
  }

  editDialogOpen.value = false

  // 重新整理該會員的報告快取
  const mid = editingReport.value.member_id
  if (expandedMemberId.value === mid) {
    const next = { ...reportsCache.value }
    delete next[mid]
    reportsCache.value = next
    await toggleReports(mid)
  }
}
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-semibold">LINE 會員管理</h1>

    <!-- 搜尋 -->
    <div class="relative max-w-sm">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input v-model="search" placeholder="搜尋 LINE ID 或顯示名稱..." class="pl-9" />
    </div>

    <!-- 資料表 -->
    <div class="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-14">頭像</TableHead>
            <TableHead>LINE ID</TableHead>
            <TableHead>顯示名稱</TableHead>
            <TableHead>
              <button class="flex items-center gap-1 font-medium hover:text-foreground" @click="toggleSort">
                加入時間
                <ArrowUp v-if="sortAsc" class="h-4 w-4" />
                <ArrowDown v-else class="h-4 w-4" />
              </button>
            </TableHead>
            <TableHead class="w-24 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="isLoading">
            <TableRow>
              <TableCell :colspan="5" class="h-24 text-center text-muted-foreground">
                載入中...
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="members.length">
            <template v-for="member in members" :key="member.id">
              <TableRow>
                <TableCell>
                  <img
                    v-if="member.picture_url"
                    :src="member.picture_url"
                    :alt="member.display_name"
                    class="h-8 w-8 rounded-full object-cover"
                  />
                  <div
                    v-else
                    class="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground"
                  >
                    ?
                  </div>
                </TableCell>
                <TableCell class="font-mono text-sm">{{ member.line_id }}</TableCell>
                <TableCell>{{ member.display_name }}</TableCell>
                <TableCell class="text-sm text-muted-foreground">
                  {{ formatDate(member.created_at) }}
                </TableCell>
                <TableCell class="text-right">
                  <div class="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" @click="toggleReports(member.id)">
                      <ChevronUp v-if="expandedMemberId === member.id" class="h-4 w-4" />
                      <ChevronDown v-else class="h-4 w-4" />
                      <span class="sr-only">查看驗光報告</span>
                    </Button>
                    <Button variant="ghost" size="sm" @click="openDialog(member)">
                      <FilePlus class="h-4 w-4" />
                      <span class="sr-only">新增驗光報告</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              <!-- 展開：驗光報告列表 -->
              <TableRow v-if="expandedMemberId === member.id">
                <TableCell :colspan="5" class="bg-muted/40 p-0">
                  <div class="px-4 py-3">
                    <p v-if="reportsLoading[member.id]" class="text-sm text-muted-foreground py-2">
                      載入中...
                    </p>
                    <p
                      v-else-if="!reportsCache[member.id]?.length"
                      class="text-sm text-muted-foreground py-2"
                    >
                      尚無驗光報告
                    </p>
                    <div v-else class="overflow-x-auto">
                      <table class="w-full text-xs border-separate border-spacing-0">
                        <thead>
                          <tr class="text-muted-foreground">
                            <th class="text-left font-medium pb-1 pr-3 whitespace-nowrap">建立時間</th>
                            <th class="text-center font-medium pb-1 px-3 whitespace-nowrap" colspan="4">右眼 OD</th>
                            <th class="text-center font-medium pb-1 px-3 whitespace-nowrap" colspan="4">左眼 OS</th>
                            <th class="text-left font-medium pb-1 px-3 whitespace-nowrap">PD</th>
                            <th class="text-left font-medium pb-1 px-3 whitespace-nowrap">ADD</th>
                            <th class="text-left font-medium pb-1 px-3 whitespace-nowrap">處方</th>
                            <th class="text-left font-medium pb-1 pl-3 whitespace-nowrap">備註</th>
                            <th class="pb-1"></th>
                          </tr>
                          <tr class="text-muted-foreground/70">
                            <th class="pb-2 pr-3"></th>
                            <th class="text-center font-normal pb-2 px-2">SPH</th>
                            <th class="text-center font-normal pb-2 px-2">CYL</th>
                            <th class="text-center font-normal pb-2 px-2">AXIS</th>
                            <th class="text-center font-normal pb-2 px-2">VA</th>
                            <th class="text-center font-normal pb-2 px-2">SPH</th>
                            <th class="text-center font-normal pb-2 px-2">CYL</th>
                            <th class="text-center font-normal pb-2 px-2">AXIS</th>
                            <th class="text-center font-normal pb-2 px-2">VA</th>
                            <th class="pb-2 px-3"></th>
                            <th class="pb-2 px-3"></th>
                            <th class="pb-2 px-3"></th>
                            <th class="pb-2 pl-3"></th>
                            <th class="pb-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="report in reportsCache[member.id]"
                            :key="report.id"
                            class="border-t border-border/50"
                          >
                            <td class="py-1.5 pr-3 text-muted-foreground whitespace-nowrap">
                              {{ formatDate(report.created_at ?? '') }}
                            </td>
                            <td class="py-1.5 px-2 text-center tabular-nums">{{ formatOptVal(report.od_sphere) }}</td>
                            <td class="py-1.5 px-2 text-center tabular-nums">{{ formatOptVal(report.od_cylinder) }}</td>
                            <td class="py-1.5 px-2 text-center tabular-nums">{{ report.od_axis ?? '—' }}</td>
                            <td class="py-1.5 px-2 text-center">{{ report.od_va ?? '—' }}</td>
                            <td class="py-1.5 px-2 text-center tabular-nums">{{ formatOptVal(report.os_sphere) }}</td>
                            <td class="py-1.5 px-2 text-center tabular-nums">{{ formatOptVal(report.os_cylinder) }}</td>
                            <td class="py-1.5 px-2 text-center tabular-nums">{{ report.os_axis ?? '—' }}</td>
                            <td class="py-1.5 px-2 text-center">{{ report.os_va ?? '—' }}</td>
                            <td class="py-1.5 px-3 tabular-nums">{{ formatOptVal(report.pd, 1) }}</td>
                            <td class="py-1.5 px-3 tabular-nums">{{ formatOptVal(report.add_power) }}</td>
                            <td class="py-1.5 px-3 whitespace-nowrap">
                              <span
                                v-if="report.is_final_prescription"
                                class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-green-700 font-medium"
                              >最終</span>
                              <span v-else class="text-muted-foreground">草稿</span>
                            </td>
                            <td class="py-1.5 pl-3 text-muted-foreground">{{ report.remarks ? (report.remarks.length > 10 ? report.remarks.slice(0, 10) + '...' : report.remarks) : '—' }}</td>
                            <td class="py-1.5 pl-2">
                              <div class="flex items-center gap-0.5">
                                <button type="button" class="p-1 rounded hover:bg-muted" @click="openEditDialog(report)">
                                  <Pencil class="h-3.5 w-3.5 text-muted-foreground" />
                                </button>
                                <button
                                  v-if="report.is_final_prescription"
                                  type="button"
                                  class="p-1 rounded hover:bg-muted"
                                  title="發送 LINE 通知"
                                  @click="openNotifyDialog(report, member)"
                                >
                                  <Bell class="h-3.5 w-3.5 text-blue-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </template>
          </template>
          <template v-else>
            <TableRow>
              <TableCell :colspan="5" class="h-24 text-center text-muted-foreground">
                沒有符合的會員
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- 分頁 -->
    <div class="flex items-center justify-between text-sm text-muted-foreground">
      <span>共 {{ total }} 位會員</span>
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

  <!-- 新增驗光報告 Dialog -->
  <Dialog v-model:open="dialogOpen">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>新增驗光報告</DialogTitle>
        <DialogDescription v-if="selectedMember">
          會員：{{ selectedMember.display_name }}（{{ selectedMember.line_id }}）
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-6" @submit.prevent="submitReport">
        <!-- AI 圖片辨識 -->
        <div class="rounded-lg border border-dashed p-4 space-y-3">
          <h3 class="text-sm font-semibold flex items-center gap-1.5">
            <ScanLine class="h-4 w-4" />
            AI 自動辨識（選填）
          </h3>

          <!-- Drop zone -->
          <div
            v-if="!ocrImageFile"
            class="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/40 py-6 cursor-pointer hover:bg-muted/60 transition-colors"
            @click="triggerFileInput"
          >
            <ImageUp class="h-6 w-6 text-muted-foreground" />
            <p class="text-sm text-muted-foreground">點擊上傳驗光處方圖片</p>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleOcrFileChange"
            />
          </div>

          <!-- Preview + action -->
          <div v-else class="flex items-start gap-3">
            <img
              :src="ocrImageUrl"
              alt="驗光報告預覽"
              class="h-20 w-20 rounded-md object-cover border shrink-0"
            />
            <div class="flex flex-col gap-2">
              <Button
                type="button"
                size="sm"
                :disabled="isOcrProcessing"
                @click="runOcr"
              >
                <ScanLine class="h-4 w-4 mr-1" />
                {{ isOcrProcessing ? 'AI 辨識中...' : '重新辨識' }}
              </Button>
              <button
                type="button"
                class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                @click="clearOcrImage"
              >
                <X class="h-3 w-3" /> 移除圖片
              </button>
              <span v-if="ocrSuccess" class="text-xs text-green-600 font-medium">辨識完成，欄位已填入</span>
            </div>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleOcrFileChange"
            />
          </div>

          <p v-if="ocrError" class="text-xs text-destructive">{{ ocrError }}</p>
        </div>

        <!-- 右眼 OD -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold">右眼（OD）</h3>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="space-y-1">
              <Label>球面度數 SPH</Label>
              <Input v-model="form.od_sphere" placeholder="e.g. -2.50" />
            </div>
            <div class="space-y-1">
              <Label>散光度數 CYL</Label>
              <Input v-model="form.od_cylinder" placeholder="e.g. -0.75" />
            </div>
            <div class="space-y-1">
              <Label>軸度 AXIS</Label>
              <Input v-model="form.od_axis" placeholder="e.g. 90" />
            </div>
            <div class="space-y-1">
              <Label>視力 VA</Label>
              <Input v-model="form.od_va" placeholder="e.g. 0.8" />
            </div>
          </div>
        </div>

        <!-- 左眼 OS -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold">左眼（OS）</h3>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="space-y-1">
              <Label>球面度數 SPH</Label>
              <Input v-model="form.os_sphere" placeholder="e.g. -2.50" />
            </div>
            <div class="space-y-1">
              <Label>散光度數 CYL</Label>
              <Input v-model="form.os_cylinder" placeholder="e.g. -0.75" />
            </div>
            <div class="space-y-1">
              <Label>軸度 AXIS</Label>
              <Input v-model="form.os_axis" placeholder="e.g. 90" />
            </div>
            <div class="space-y-1">
              <Label>視力 VA</Label>
              <Input v-model="form.os_va" placeholder="e.g. 0.8" />
            </div>
          </div>
        </div>

        <!-- 其他欄位 -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <Label>瞳距 PD (mm)</Label>
            <Input v-model="form.pd" placeholder="e.g. 62.5" />
          </div>
          <div class="space-y-1">
            <Label>加入度 ADD</Label>
            <Input v-model="form.add_power" placeholder="e.g. 1.50" />
          </div>
        </div>

        <!-- 備註 -->
        <div class="space-y-1">
          <Label>備註</Label>
          <textarea
            v-model="form.remarks"
            placeholder="備註..."
            rows="3"
            class="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>

        <!-- 最終處方 -->
        <div class="flex items-center gap-2">
          <input
            id="is-final"
            v-model="form.is_final_prescription"
            type="checkbox"
            class="h-4 w-4 rounded border-input accent-primary"
          />
          <Label for="is-final">設為最終處方</Label>
        </div>

        <p v-if="submitError" class="text-sm text-destructive">{{ submitError }}</p>

        <DialogFooter>
          <Button type="button" variant="outline" @click="dialogOpen = false">取消</Button>
          <Button type="submit" :disabled="isSubmitting || isOcrProcessing">
            {{ isSubmitting ? '儲存中...' : '儲存報告' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  <!-- LINE 通知 Dialog -->
  <Dialog v-model:open="notifyDialogOpen">
    <DialogContent class="max-w-lg">
      <DialogHeader>
        <DialogTitle>發送 LINE 通知</DialogTitle>
        <DialogDescription v-if="notifyMember">
          收件人：{{ notifyMember.display_name }}（{{ notifyMember.line_id }}）
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="submitNotification">
        <div class="space-y-1">
          <Label>訊息內容</Label>
          <textarea
            v-model="notifyForm.message"
            rows="5"
            required
            class="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>

        <div class="space-y-1">
          <Label>排程時間（選填，留空代表由後端立即處理）</Label>
          <input
            v-model="notifyForm.scheduled_at"
            type="datetime-local"
            class="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <p v-if="notifySubmitError" class="text-sm text-destructive">{{ notifySubmitError }}</p>

        <DialogFooter>
          <Button type="button" variant="outline" @click="notifyDialogOpen = false">取消</Button>
          <Button type="submit" :disabled="isNotifySubmitting">
            {{ isNotifySubmitting ? '建立中...' : '建立通知' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  <!-- 編輯驗光報告 Dialog -->
  <Dialog v-model:open="editDialogOpen">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>編輯驗光報告</DialogTitle>
        <DialogDescription v-if="editingReport">
          建立時間：{{ formatDate(editingReport.created_at ?? '') }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-6" @submit.prevent="submitEditReport">
        <!-- 右眼 OD -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold">右眼（OD）</h3>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="space-y-1">
              <Label>球面度數 SPH</Label>
              <Input v-model="editForm.od_sphere" placeholder="e.g. -2.50" />
            </div>
            <div class="space-y-1">
              <Label>散光度數 CYL</Label>
              <Input v-model="editForm.od_cylinder" placeholder="e.g. -0.75" />
            </div>
            <div class="space-y-1">
              <Label>軸度 AXIS</Label>
              <Input v-model="editForm.od_axis" placeholder="e.g. 90" />
            </div>
            <div class="space-y-1">
              <Label>視力 VA</Label>
              <Input v-model="editForm.od_va" placeholder="e.g. 0.8" />
            </div>
          </div>
        </div>

        <!-- 左眼 OS -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold">左眼（OS）</h3>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="space-y-1">
              <Label>球面度數 SPH</Label>
              <Input v-model="editForm.os_sphere" placeholder="e.g. -2.50" />
            </div>
            <div class="space-y-1">
              <Label>散光度數 CYL</Label>
              <Input v-model="editForm.os_cylinder" placeholder="e.g. -0.75" />
            </div>
            <div class="space-y-1">
              <Label>軸度 AXIS</Label>
              <Input v-model="editForm.os_axis" placeholder="e.g. 90" />
            </div>
            <div class="space-y-1">
              <Label>視力 VA</Label>
              <Input v-model="editForm.os_va" placeholder="e.g. 0.8" />
            </div>
          </div>
        </div>

        <!-- 其他欄位 -->
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1">
            <Label>瞳距 PD (mm)</Label>
            <Input v-model="editForm.pd" placeholder="e.g. 62.5" />
          </div>
          <div class="space-y-1">
            <Label>加入度 ADD</Label>
            <Input v-model="editForm.add_power" placeholder="e.g. 1.50" />
          </div>
        </div>

        <!-- 備註 -->
        <div class="space-y-1">
          <Label>備註</Label>
          <textarea
            v-model="editForm.remarks"
            placeholder="備註..."
            rows="3"
            class="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />
        </div>

        <!-- 最終處方 -->
        <div class="flex items-center gap-2">
          <input
            id="edit-is-final"
            v-model="editForm.is_final_prescription"
            type="checkbox"
            class="h-4 w-4 rounded border-input accent-primary"
          />
          <Label for="edit-is-final">設為最終處方</Label>
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
