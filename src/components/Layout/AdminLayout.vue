<script setup lang="ts">
import { useAdminAuthStore } from '@/stores/adminAuth'

const adminAuth = useAdminAuthStore()
const router = useRouter()

async function handleSignOut() {
  await adminAuth.signOut()
  router.push('/admin/login')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <!-- Navbar -->
    <header class="border-b bg-white">
      <div class="flex items-center justify-between px-6 h-14">
        <span class="font-semibold text-sm">後台管理系統</span>
        <div class="flex items-center gap-4">
          <span class="text-sm text-muted-foreground">{{ adminAuth.adminEmail }}</span>
          <Button variant="outline" size="sm" @click="handleSignOut">登出</Button>
        </div>
      </div>
    </header>

    <div class="flex flex-1">
      <!-- Sidebar -->
      <aside class="w-48 border-r bg-white">
        <nav class="p-4">
          <RouterLink
            to="/admin/bookings"
            class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            active-class="bg-accent text-accent-foreground"
          >
            預約管理
          </RouterLink>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
