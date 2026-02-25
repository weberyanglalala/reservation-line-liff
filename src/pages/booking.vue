<script setup lang="ts">
import { Form, Field as FormField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabaseClient'

const auth = useAuthStore()
const router = useRouter()

if (!auth.isLoggedIn || !auth.isRegistered) {
  router.replace('/')
}

const bookingSchema = toTypedSchema(
  z.object({
    service: z.string().min(1, '請選擇服務項目'),
    booking_date: z.string().min(1, '請選擇預約日期'),
    booking_time: z.string().min(1, '請選擇預約時間'),
    notes: z.string().max(200, '備註不得超過 200 字').optional(),
  }),
)

const SERVICE_OPTIONS = ['剪髮', '染髮', '燙髮', '護髮', '造型']
const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']

const isSubmitting = ref(false)
const isSuccess = ref(false)
const errorMessage = ref('')

async function handleSubmit(values: Record<string, unknown>) {
  const { service, booking_date, booking_time, notes } = values as {
    service: string
    booking_date: string
    booking_time: string
    notes?: string
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const { error } = await supabase.from('bookings').insert({
      member_id: auth.member!.id,
      service,
      booking_date,
      booking_time,
      notes: notes ?? null,
    })
    if (error) throw error
    isSuccess.value = true
  } catch {
    errorMessage.value = '預約失敗，請再試一次'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6 max-w-sm mx-auto pt-8">
    <div>
      <h1 class="text-xl font-semibold">線上預約</h1>
      <p class="text-sm text-muted-foreground mt-1">歡迎，{{ auth.member?.display_name }}</p>
    </div>

    <!-- 成功訊息 -->
    <div v-if="isSuccess" class="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
      <p class="font-medium">預約成功！</p>
      <p class="mt-1 text-green-700">我們已收到您的預約，將盡快與您確認。</p>
    </div>

    <Form v-else :validation-schema="bookingSchema" class="space-y-4" @submit="handleSubmit">
      <!-- 服務項目 -->
      <FormField v-slot="{ componentField }" name="service">
        <FormItem>
          <FormLabel>服務項目</FormLabel>
          <FormControl>
            <select
              v-bind="componentField"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">請選擇服務項目</option>
              <option v-for="opt in SERVICE_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- 預約日期 -->
      <FormField v-slot="{ componentField }" name="booking_date">
        <FormItem>
          <FormLabel>預約日期</FormLabel>
          <FormControl>
            <Input type="date" v-bind="componentField" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- 預約時間 -->
      <FormField v-slot="{ componentField }" name="booking_time">
        <FormItem>
          <FormLabel>預約時間</FormLabel>
          <FormControl>
            <select
              v-bind="componentField"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">請選擇時間</option>
              <option v-for="t in TIME_SLOTS" :key="t" :value="t">{{ t }}</option>
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- 備註 -->
      <FormField v-slot="{ componentField }" name="notes">
        <FormItem>
          <FormLabel>備註（選填）</FormLabel>
          <FormControl>
            <textarea
              v-bind="componentField"
              rows="3"
              placeholder="有其他需求或說明，請填寫於此"
              class="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <Alert v-if="errorMessage" variant="destructive">
        <AlertDescription>{{ errorMessage }}</AlertDescription>
      </Alert>

      <Button type="submit" class="w-full" :disabled="isSubmitting">
        {{ isSubmitting ? '送出中...' : '送出預約' }}
      </Button>
    </Form>
  </div>
</template>
