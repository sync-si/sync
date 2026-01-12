<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const timeLeft = ref(30)

const emit = defineEmits<{
    (e: 'sessionDeath'): void
}>()

let interval: ReturnType<typeof setInterval>

onMounted(() => {
    interval = setInterval(() => {
        if (timeLeft.value > 0) {
            timeLeft.value--
        } else {
            clearInterval(interval)
            emit('sessionDeath')
        }
    }, 1000)
})

onUnmounted(() => {
    clearInterval(interval)
})

function formattedTime() {
    const minutes = Math.floor(timeLeft.value / 60)
    const seconds = timeLeft.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
</script>

<template>
    <div class="r-prompt shadow-medium">
        <span style="font-size: 20px; font-weight: var(--s-weight-bold)">Reconnecting</span>
        <span>{{ `WebSocket connection lost. Session death in ${formattedTime()}` }}</span>
    </div>
</template>

<style scoped>
.r-prompt {
    position: absolute;
    display: flex;
    flex-direction: column;

    width: 246px;

    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    text-align: center;
    font-size: 16px;
    color: var(--s-background);
    background-color: var(--s-error);

    padding: 16px;
    gap: 8px;

    border-radius: 8px;
}
</style>
