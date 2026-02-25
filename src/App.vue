<script setup lang="ts">
const route = useRoute()
const layout = computed(() => {
  const meta = route.meta as { layout?: string }
  return meta.layout ?? 'liff'
})
</script>

<template>
  <AdminLayout v-if="layout === 'admin'">
    <RouterView />
  </AdminLayout>
  <LiffLayout v-else>
    <RouterView />
  </LiffLayout>
</template>
