<script setup lang="ts">
import 'vidstack/player/styles/default/theme.css'
import 'vidstack/player'
import 'vidstack/player/ui'
import 'vidstack/icons'
import type { MediaPlayerElement } from 'vidstack/elements'

import { ref, useTemplateRef, watch, nextTick } from 'vue'
import type { SyncState } from '@sync/wire'
import type { PingResult } from '../../stores/room'
import { parseMediaJwt, type MediaJWT } from '../../util/mediajwt'
import { usePlayerStore } from '../../stores/player'
import { useInteractionStore } from '../../stores/interaction'
import VideoLayout from './layouts/VideoLayout.vue'
import { useEventListener, useIntervalFn } from '@vueuse/core'

const playerStore = usePlayerStore()
const interactionStore = useInteractionStore()

const pendingPlay = ref(false)
const isSyncing = ref(false)
const autoplayBlocked = ref(false)

function handleOverlayClick() {
    interactionStore.markInteraction()
    autoplayBlocked.value = false
    if (props.syncState.state === 'playing' && player.value?.paused) {
        syncToPlaying()
    }
}

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

const source = ref<MediaJWT>()

const player = useTemplateRef<MediaPlayerElement>('player')

/**
 * Attempts to play the video with proper error handling.
 * Browsers may block autoplay, so we handle the promise rejection.
 */
async function tryPlay(targetTime: number): Promise<boolean> {
    if (!player.value || pendingPlay.value) return false

    pendingPlay.value = true
    isSyncing.value = true
    try {
        player.value.currentTime = targetTime

        const playPromise = player.value.play()
        if (playPromise !== undefined) {
            await playPromise
        }

        console.log('[SyncPlayer] Play succeeded')
        autoplayBlocked.value = false
        return true
    } catch (err: unknown) {
        const isAutoplayError =
            err instanceof Error &&
            (err.name === 'NotAllowedError' || err.message.includes('user gesture'))

        if (isAutoplayError) {
            console.warn('[SyncPlayer] Autoplay blocked by browser policy')
            autoplayBlocked.value = true
            emit('struggle')
        } else {
            console.warn('[SyncPlayer] Play failed:', err)
        }
        return false
    } finally {
        pendingPlay.value = false
        setTimeout(() => {
            isSyncing.value = false
        }, 100)
    }
}

/**
 * Syncs to the current playing state, calculating the correct time position.
 */
function syncToPlaying() {
    if (!player.value || props.syncState.state !== 'playing') return

    const targetTime = (getTime() - (props.syncState.offset ?? 0)) / 1000
    tryPlay(targetTime)
}

/**
 * Syncs to the current paused state.
 */
function syncToPaused() {
    if (!player.value || props.syncState.state !== 'paused') return

    isSyncing.value = true
    player.value.pause()
    player.value.currentTime = (props.syncState.position ?? 0) / 1000

    setTimeout(() => {
        isSyncing.value = false
    }, 50)
}

useEventListener(player, 'can-play', () => {
    if (props.isOwner) return

    console.log('[SyncPlayer] can-play event, syncing state:', props.syncState.state)

    if (props.syncState.state === 'playing') {
        syncToPlaying()
    } else if (props.syncState.state === 'paused') {
        syncToPaused()
    }
})

watch(
    () => props.syncState,
    async (x, oldX) => {
        if (x.state === 'idle') {
            player.value?.pause()
            return
        }

        if (props.isOwner && source.value?.token === x.media) {
            return // prevent syncing against ourselves
        }

        const mediaChanged = source.value?.token !== x.media
        if (mediaChanged) {
            source.value = parseMediaJwt(x.media)
            console.log('[SyncPlayer] Media changed, waiting for player to load')
            return
        }

        console.log('[SyncPlayer] Received sync state:', x.state, 'from:', oldX?.state)

        if (!player.value) return

        await nextTick()

        if (x.state === 'paused') {
            syncToPaused()
            return
        }

        if (x.state === 'playing') {
            syncToPlaying()
            return
        }
    },
    { deep: true },
)

useIntervalFn(() => {
    if (props.isOwner) return
    if (!player.value) return
    if (props.syncState.state !== 'playing') return
    if (pendingPlay.value) return
    if (autoplayBlocked.value) return

    const expectedTime = (getTime() - (props.syncState.offset ?? 0)) / 1000
    const currentTime = player.value.currentTime
    const drift = Math.abs(expectedTime - currentTime)

    if (player.value.paused) {
        console.log('[SyncPlayer] Interval: player paused but should be playing, resyncing')
        syncToPlaying()
    } else if (drift > 2) {
        console.log('[SyncPlayer] Interval: drift correction, off by', drift.toFixed(2), 'seconds')
        player.value.currentTime = expectedTime
    }
}, 500)

useEventListener(player, 'play', () => {
    if (!props.isOwner || isSyncing.value) return

    emit('sync', {
        state: 'playing',
        media: source.value?.token ?? '',
        rate: 1,
        offset: getTime() - (player.value?.currentTime ?? 0) * 1000,
    })
})

useEventListener(player, 'pause', () => {
    if (!props.isOwner || isSyncing.value) return

    emit('sync', {
        state: 'paused',
        media: source.value?.token ?? '',
        position: (player.value?.currentTime ?? 0) * 1000,
    })
})

useEventListener(player, 'seeked', () => {
    if (!props.isOwner || isSyncing.value) return

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
    <div class="player-wrapper">
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

        <div
            v-if="autoplayBlocked && !isOwner"
            class="autoplay-overlay"
            @click="handleOverlayClick"
        >
            <div class="autoplay-message">
                <span>Click to enable playback</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.player-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
}

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

.autoplay-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    cursor: pointer;
    z-index: 100;
    border-radius: var(--media-border-radius, 8px);
}

.autoplay-message {
    padding: 16px 32px;
    background: var(--s-primary, #6366f1);
    color: white;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    transition: transform 0.15s ease;
}

.autoplay-overlay:hover .autoplay-message {
    transform: scale(1.05);
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
