import { defineStore } from 'pinia'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

export const useAdminAuthStore = defineStore('adminAuth', () => {
  const session = ref<Session | null>(null)
  const isLoading = ref(true)

  const isAuthenticated = computed(() => !!session.value)
  const adminEmail = computed(() => session.value?.user?.email ?? '')
  const adminId = computed(() => session.value?.user?.id ?? null)

  async function init() {
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    isLoading.value = false

    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
    })
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    session.value = data.session
  }

  async function signOut() {
    await supabase.auth.signOut()
    session.value = null
  }

  return { session, isLoading, isAuthenticated, adminEmail, adminId, init, signIn, signOut }
})
