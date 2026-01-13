<script setup lang="ts">
function formattedTime(timeLeft: number) {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// TODO: props
</script>

<template>
    <div class="r-prompt shadow-medium">
        <span style="font-size: 20px; font-weight: var(--s-weight-bold)">Reconnecting</span>
        <span>{{ `WebSocket connection lost. Session death in ${formattedTime(13)}` }}</span>
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
