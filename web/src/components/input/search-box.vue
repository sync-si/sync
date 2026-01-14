<script setup lang="ts">
import { ref } from 'vue'
import { isValidUrl, parseMediaJwt, type MediaJWT } from '../../util/mediajwt'
import SyncIcon from '../icon/sync-icon.vue'
import MediaCard from '../queue/media-card.vue'
import { useToastStore } from '../../stores/toast'

const search = ref<string>('')
const busy = ref<boolean>(false)
const result = ref<MediaJWT>()

const props = defineProps<{
    sessionKey: string
    isOwner: boolean
}>()

const emit = defineEmits<{
    suggest: [MediaJWT]
    play: [MediaJWT]
    queue: [MediaJWT]
}>()

const toast = useToastStore()

async function test() {
    if (busy.value || result.value) return
    const v = search.value.trim()

    if (v.length === 0) {
        toast.error('Empty URL')
    }

    if (!isValidUrl(v)) {
        toast.error('Invalid URL')
        return
    }

    busy.value = true

    try {
        const response = await fetch('/api/media/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${props.sessionKey}`,
            },
            body: JSON.stringify({ source: v }),
        })

        const body = await response.json()

        if (!response.ok) {
            const msg = (body as { message: string }).message
            toast.error(msg)
            return
        }

        result.value = parseMediaJwt((body as { media: string }).media)
    } catch {
        // server error
    } finally {
        busy.value = false
    }
}

function dismiss() {
    result.value = undefined
    search.value = ''
}

function emitAndDismiss(event: 'play' | 'queue' | 'suggest') {
    if (!result.value) return
    emit(event as unknown as 'play', result.value)
    dismiss()
}
</script>

<template>
    <div class="search-box" :class="{ busy }" @keypress.enter.prevent="test">
        <SyncIcon class="globe-icon" :size="24" icon="globe" />
        <input :disabled="busy" type="text" placeholder="Video URL..." v-model="search" />

        <MediaCard
            class="result shadow-medium"
            v-if="result"
            :can-play="isOwner"
            :can-queue="isOwner"
            :can-suggest="!isOwner"
            :can-dismiss="true"
            state="suggestion"
            :media="result"
            @play="emitAndDismiss('play')"
            @queue="emitAndDismiss('queue')"
            @suggest="emitAndDismiss('suggest')"
            @dismiss="dismiss()"
        />
    </div>
</template>

<style scoped>
.search-box {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    padding: 0 8px;
    border-radius: 6px;
    background-color: var(--s-background-alt);
    position: relative;

    &.busy {
        opacity: 0.6;
        pointer-events: none;
    }

    &:focus-within {
        outline: 2px solid var(--s-primary-light);

        .globe-icon {
            fill: var(--s-primary);
        }
    }
}

.globe-icon {
    flex-shrink: 0;
    fill: var(--s-text-subtler);
}

input {
    flex: 1;
    height: 32px;
    border: none;
    font-size: 14px;
    font-family: var(--s-font);
    color: var(--s-text);
    background-color: var(--s-background-secondary);

    outline: none !important;
}

input::placeholder {
    color: var(--s-text-subtle);
}

.result {
    position: absolute;
    top: 40px;
    left: 0;
    right: 0;
    z-index: 10;
    background-color: var(--s-background);
}
</style>
