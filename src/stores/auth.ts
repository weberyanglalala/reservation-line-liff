import { defineStore } from 'pinia'
import liff from '@line/liff'
import { supabase } from '@/lib/supabaseClient'
import type { Tables } from '../../database/types'

type Member = Tables<'members'>

export const useAuthStore = defineStore('auth', () => {
  const lineProfile = ref<{ userId: string; displayName: string; pictureUrl?: string } | null>(
    null
  )
  const member = ref<Member | null>(null)
  const isLiffReady = ref(false)
  const isLoading = ref(true)

  const isLoggedIn = computed(() => !!lineProfile.value)
  const isRegistered = computed(() => !!member.value)

  async function initLiff() {
    await liff.init({ liffId: import.meta.env.VITE_LIFF_ID })
    isLiffReady.value = true

    if (!liff.isLoggedIn()) {
      liff.login()
      return
    }

    const profile = await liff.getProfile()
    lineProfile.value = {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl
    }

    await fetchMember(profile.userId)
    isLoading.value = false
  }

  async function fetchMember(lineId: string) {
    const { data } = await supabase.from('members').select('*').eq('line_id', lineId).maybeSingle()
    member.value = data
  }

  async function register() {
    if (!lineProfile.value) return

    const { data, error } = await supabase
      .from('members')
      .insert({
        line_id: lineProfile.value.userId,
        display_name: lineProfile.value.displayName,
        picture_url: lineProfile.value.pictureUrl ?? null
      })
      .select()
      .single()

    if (error) throw error
    member.value = data
  }

  return { lineProfile, member, isLiffReady, isLoading, isLoggedIn, isRegistered, initLiff, register }
})
