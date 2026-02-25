<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const isSubmitting = ref(false)
const errorMessage = ref('')

if (!auth.isLoggedIn) {
  router.replace('/')
}

if (auth.isRegistered) {
  router.replace('/profile')
}

async function handleRegister() {
  isSubmitting.value = true
  errorMessage.value = ''
  try {
    await auth.register()
    router.replace('/profile')
  } catch {
    errorMessage.value = '註冊失敗，請再試一次。'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-center gap-6 p-6 max-w-sm mx-auto pt-12">
    <img
      v-if="auth.lineProfile?.pictureUrl"
      :src="auth.lineProfile.pictureUrl"
      :alt="auth.lineProfile?.displayName"
      class="w-24 h-24 rounded-full object-cover"
    />
    <div class="text-center">
      <h1 class="text-xl font-semibold">歡迎，{{ auth.lineProfile?.displayName }}</h1>
      <p class="text-sm text-muted-foreground mt-1">點擊下方按鈕完成會員註冊</p>
    </div>

    <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>

    <button
      class="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
      :disabled="isSubmitting"
      @click="handleRegister"
    >
      {{ isSubmitting ? '註冊中...' : '立即加入會員' }}
    </button>
  </div>
</template>
