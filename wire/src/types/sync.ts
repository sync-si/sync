import type { Media } from './media.js'

export interface SyncIdle {
    state: 'idle'
}

export interface SyncPaused {
    state: 'paused'

    media: Media
    position: number
}

export interface SyncPlaying {
    state: 'playing'

    media: Media
    offset: number
    rate: number
}

export type SyncState = SyncIdle | SyncPaused | SyncPlaying

export interface PlaybackStats {
    latency: number
    offset: number
    buffer: number
}
