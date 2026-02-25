<script setup lang="ts">
import { Form, Field as FormField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useAdminAuthStore } from '@/stores/adminAuth'

definePage({ meta: { layout: 'blank' } })

const adminAuth = useAdminAuthStore()
const router = useRouter()

const loginSchema = toTypedSchema(
  z.object({
    email: z.string().email('請輸入有效的 Email'),
    password: z.string().min(8, '密碼至少 8 個字元'),
  })
)

const errorMessage = ref('')
const isSubmitting = ref(false)

async function handleSubmit(values: Record<string, unknown>) {
  const { email, password } = values as { email: string; password: string }
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await adminAuth.signIn(email, password)
    router.push('/admin/bookings')
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    errorMessage.value = msg.includes('Invalid login credentials')
      ? '帳號或密碼錯誤'
      : '登入失敗，請再試一次'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <div class="w-full max-w-sm space-y-6 p-8 border rounded-xl shadow-sm bg-white">
      <div class="space-y-1 text-center">
        <h1 class="text-2xl font-semibold">後台管理登入</h1>
        <p class="text-sm text-muted-foreground">請輸入管理員帳號與密碼</p>
      </div>

      <Form :validation-schema="loginSchema" class="space-y-4" @submit="handleSubmit">
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
              <Input type="password" placeholder="請輸入密碼" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Alert v-if="errorMessage" variant="destructive">
          <AlertDescription>{{ errorMessage }}</AlertDescription>
        </Alert>

        <Button type="submit" class="w-full" :disabled="isSubmitting">
          {{ isSubmitting ? '登入中...' : '登入' }}
        </Button>
      </Form>
      <p class="text-center text-sm text-muted-foreground">
        還沒有帳號？
        <RouterLink to="/admin/register" class="font-medium text-foreground underline underline-offset-2">
          建立帳號
        </RouterLink>
      </p>
    </div>
  </div>
</template>
