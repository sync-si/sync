<script setup lang="ts">
import type { MediaBody } from '@sync/wire'

const props = defineProps<{
    username: string
    // image: string
    timestamp: Date

    text?: string
    recommendation?: MediaBody
}>()
</script>

<template>
    <div class="c-msg">
        <!-- <img class="avatar" :src="props.image" :alt="`${props.username}'s Avatar'`" /> -->
        <div class="c-msg-body">
            <div class="name-time-row">
                <span class="name">{{ props.username }}</span>
                <span class="time">{{
                    props.timestamp.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                    })
                }}</span>
            </div>
            <div v-if="props.text" class="c-msg-content text">
                <span>{{ props.text }}</span>
            </div>
            <div v-else class="c-msg-content recommendation"></div>
        </div>
    </div>
</template>

<style scoped>
.c-msg {
    display: flex;
    flex-direction: row;

    padding: 8px;
    gap: 8px;

    font-family: var(--s-font);
}

.avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
}

.c-msg-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.text {
    font-size: 13px;
}

.name-time-row {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
}

.name {
    font-size: 16px;
    font-weight: var(--s-weight-bold);
}

.time {
    font-size: 12px;
    color: var(--s-text-subtle);
}
</style>
