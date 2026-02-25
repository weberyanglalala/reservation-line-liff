<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

if (!auth.isLoggedIn || !auth.isRegistered) {
  router.replace('/')
}
</script>

<template>
  <div class="flex flex-col items-center gap-6 p-6 max-w-sm mx-auto pt-12">
    <img
      v-if="auth.lineProfile?.pictureUrl"
      :src="auth.lineProfile.pictureUrl"
      :alt="auth.lineProfile.displayName"
      class="w-24 h-24 rounded-full object-cover"
    />
    <div class="text-center">
      <h1 class="text-2xl font-semibold">{{ auth.member?.display_name }}</h1>
      <p class="text-sm text-muted-foreground mt-1">LINE ID：{{ auth.member?.line_id }}</p>
      <p class="text-sm text-muted-foreground">
        加入日期：{{ new Date(auth.member!.created_at).toLocaleDateString('zh-TW') }}
      </p>
    </div>
    <Button class="w-full" @click="router.push('/booking')">立即預約</Button>
  </div>
</template>
