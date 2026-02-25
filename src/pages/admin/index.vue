<script setup lang="ts">
definePage({ meta: { layout: 'admin' } })
const router = useRouter()
onMounted(() => router.replace('/admin/bookings'))
</script>

<template>
  <div />
</template>
