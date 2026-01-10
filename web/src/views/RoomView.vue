<script setup lang="ts">
import { useSessionStore } from '../stores/session'

const sessionStore = useSessionStore()

const props = defineProps<{
    roomId: string
}>()
</script>

<template>
    <h1>Room {{ props.roomId }}</h1>
    <pre>{{ sessionStore.activeSession }}</pre>
</template>
