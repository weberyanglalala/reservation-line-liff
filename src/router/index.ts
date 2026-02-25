import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { useAdminAuthStore } from '@/stores/adminAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to) => {
  if (!to.path.startsWith('/admin')) return true

  const adminAuth = useAdminAuthStore()
  if (adminAuth.isLoading) await adminAuth.init()

  if (to.path === '/admin/login' || to.path === '/admin/register') {
    return adminAuth.isAuthenticated ? '/admin/bookings' : true
  }

  if (!adminAuth.isAuthenticated) {
    return '/admin/login'
  }
})

export default router
