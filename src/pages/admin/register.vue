<script setup lang="ts">
import { Form, Field as FormField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabaseClient'

definePage({ meta: { layout: 'blank' } })

const registerSchema = toTypedSchema(
  z
    .object({
      email: z.string().email('請輸入有效的 Email'),
      password: z.string().min(8, '密碼至少 8 個字元'),
      confirmPassword: z.string().min(8, '密碼至少 8 個字元'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: '兩次密碼不一致',
      path: ['confirmPassword'],
    }),
)

const router = useRouter()
const isSubmitting = ref(false)
const isPendingConfirmation = ref(false)
const errorMessage = ref('')

async function handleSubmit(values: Record<string, unknown>) {
  const { email, password } = values as { email: string; password: string }
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error

    // Supabase returns empty identities array for already-registered emails
    // (avoids revealing whether an email is taken)
    if (!data.user?.identities?.length) {
      errorMessage.value = '此 Email 已被註冊'
      return
    }

    if (data.session) {
      // Email confirmation disabled — signed in immediately
      router.replace('/admin/bookings')
    } else {
      // Email confirmation required — show pending message
      isPendingConfirmation.value = true
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    errorMessage.value = msg || '註冊失敗，請再試一次'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="w-full max-w-sm space-y-6 p-8 border rounded-xl shadow-sm bg-white">
      <div class="space-y-1 text-center">
        <h1 class="text-2xl font-semibold">建立管理員帳號</h1>
        <p class="text-sm text-muted-foreground">填寫資料以註冊後台帳號</p>
      </div>

      <!-- 待驗證信箱訊息 -->
      <div
        v-if="isPendingConfirmation"
        class="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 space-y-1"
      >
        <p class="font-medium">請確認您的信箱</p>
        <p class="text-green-700">驗證信已寄出，點擊信中連結後即可登入。</p>
        <RouterLink to="/admin/login" class="mt-2 inline-block font-medium underline underline-offset-2">
          前往登入
        </RouterLink>
      </div>

      <Form v-else :validation-schema="registerSchema" class="space-y-4" @submit="handleSubmit">
        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="admin@example.com" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel>密碼</FormLabel>
            <FormControl>
              <Input type="password" placeholder="至少 8 個字元" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="confirmPassword">
          <FormItem>
            <FormLabel>確認密碼</FormLabel>
            <FormControl>
              <Input type="password" placeholder="再次輸入密碼" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Alert v-if="errorMessage" variant="destructive">
          <AlertDescription>{{ errorMessage }}</AlertDescription>
        </Alert>

        <Button type="submit" class="w-full" :disabled="isSubmitting">
          {{ isSubmitting ? '註冊中...' : '建立帳號' }}
        </Button>
      </Form>

      <p class="text-center text-sm text-muted-foreground">
        已有帳號？
        <RouterLink to="/admin/login" class="font-medium text-foreground underline underline-offset-2">
          前往登入
        </RouterLink>
      </p>
    </div>
  </div>
</template>
