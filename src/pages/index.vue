<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

onMounted(async () => {
  await auth.initLiff()
  if (auth.isRegistered) {
    router.replace('/profile')
  } else {
    router.replace('/register')
  }
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <span class="text-muted-foreground">載入中...</span>
  </div>
</template>
