<script setup lang="ts">
import 'vidstack/player/styles/default/theme.css'
import 'vidstack/player'
import 'vidstack/player/ui'
import 'vidstack/icons'
import type { MediaPlayerElement } from 'vidstack/elements'

import { ref, useTemplateRef, watch } from 'vue'
import type { SyncState } from '@sync/wire'
import type { PingResult } from '../../stores/room'
import { parseMediaJwt, type MediaJWT } from '../../util/mediajwt'
import { usePlayerStore } from '../../stores/player'
import VideoLayout from './layouts/VideoLayout.vue'
import { useEventListener, useIntervalFn } from '@vueuse/core'

const playerStore = usePlayerStore()

const storage = {
    getVolume: async () => playerStore.volume,
    setVolume: async (x: number) => playerStore.setVolume(x),
    getMuted: async () => playerStore.muted,
    setMuted: async (x: boolean) => playerStore.setMuted(x),
    getTime: async () => null,
    setTime: async () => {},
    getLang: async () => null,
    setLang: async () => {},
    getCaptions: async () => null,
    setCaptions: async () => {},
    getPlaybackRate: async () => 1,
    setPlaybackRate: async () => {},
    onLoad: async () => {},
    onChange: () => null,
    onDestroy: async () => {},
    getVideoQuality: async () => null,
    getAudioGain: async () => null,
}

const props = defineProps<{
    isOwner: boolean
    syncState: SyncState
    time: PingResult
}>()

const emit = defineEmits<{
    sync: [s: SyncState]
    struggle: []
}>()

function getTime() {
    return Date.now() + props.time.offset
}

// const source = computed(() => {
//     console.log('[SyncPlayer] Computing source from sync state:', props.syncState)
//     if (props.syncState.state === 'idle') return undefined
//     return parseMediaJwt(props.syncState.media)
// })

const source = ref<MediaJWT>()

watch(
    () => props.syncState,
    (x) => {
        if (x.state === 'idle') {
            player.value?.pause()
            return
        }

        if (props.isOwner && source.value?.token === x.media) {
            return // prevent syncing agains ourselves
        }

        if (source.value?.token !== x.media) {
            source.value = parseMediaJwt(x.media)
        }
        console.log('[SyncPlayer] Received sync state:', x.state)

        if (!player.value) return

        if (x.state === 'paused') {
            if (!player.value) return
            player.value.pause()
            player.value.currentTime = (x.position ?? 0) / 1000
            return
        }

        if (x.state === 'playing') {
            player.value.currentTime = (getTime() - (x.offset ?? 0)) / 1000
            player.value.play()
            return
        }
    },
)

useIntervalFn(() => {
    console.log(props.syncState.state, player.value?.paused)

    if (props.isOwner) {
        return
    }

    if (!player.value) return

    if (props.syncState.state !== 'playing') return

    if (player.value.paused) {
        player.value.currentTime = (getTime() - (props.syncState.offset ?? 0)) / 1000
        player.value.play()
    }
}, 333)

const player = useTemplateRef<MediaPlayerElement>('player')

useEventListener(player, 'play', () => {
    emit('sync', {
        state: 'playing',
        media: source.value?.token ?? '',
        rate: 1,
        offset: getTime() - (player.value?.currentTime ?? 0) * 1000,
    })
})

useEventListener(player, 'pause', () => {
    emit('sync', {
        state: 'paused',
        media: source.value?.token ?? '',
        position: (player.value?.currentTime ?? 0) * 1000,
    })
})

useEventListener(player, 'seeked', () => {
    if (player.value?.paused) {
        emit('sync', {
            state: 'paused',
            media: source.value?.token ?? '',
            position: (player.value?.currentTime ?? 0) * 1000,
        })
        return
    }

    emit('sync', {
        state: 'playing',
        media: source.value?.token ?? '',
        rate: 1,
        offset: getTime() - (player.value?.currentTime ?? 0) * 1000,
    })
})
</script>

<template>
    <media-player
        v-if="source"
        class="player"
        :title="source?.title"
        :src="source?.source"
        crossOrigin
        playsInline
        load="eager"
        ref="player"
        :storage="storage"
        :key-disabled="!isOwner"
    >
        <media-provider></media-provider>

        <VideoLayout :is-owner="isOwner" />
    </media-player>
</template>

<style scoped>
.player {
    --media-brand: var(--s-primary);
    --media-focus-ring-color: --var(--s-player-focus);
    --media-focus-ring: 0 0 0 3px var(--media-focus-ring-color);
    width: 100%;
    height: 100%;
}

.player[data-view-type='video'] {
    --media-tooltip-y-offset: 30px;
    --media-menu-y-offset: 30px;
    background-color: #212121;
    border-radius: var(--media-border-radius);
    contain: layout;
}

.player :deep(video) {
    width: 100%;
    height: 100%;
}

.src-buttons {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    margin-top: 40px;
    margin-inline: auto;
    max-width: 300px;
}
</style>
