import { defineStore } from 'pinia'
import { ref } from 'vue'

const KEY = 'sync3-volume'
const MUTED_KEY = 'sync3-muted'
const DEFAULT_VOLUME = 0.5
const DEFAULT_MUTED = false

function loadVolume(): number {
    try {
        const stored = localStorage.getItem(KEY)
        if (stored === null) return DEFAULT_VOLUME

        const volume = parseFloat(stored)
        return isNaN(volume) || volume < 0 || volume > 1 ? DEFAULT_VOLUME : volume
    } catch {
        return DEFAULT_VOLUME
    }
}

function storeVolume(volume: number) {
    localStorage.setItem(KEY, volume.toString())
}

function loadMuted(): boolean {
    try {
        const stored = localStorage.getItem(MUTED_KEY)
        if (stored === null) return DEFAULT_MUTED
        return stored === 'true'
    } catch {
        return DEFAULT_MUTED
    }
}

function storeMuted(muted: boolean) {
    localStorage.setItem(MUTED_KEY, muted.toString())
}

export const usePlayerStore = defineStore('player', () => {
    const volume = ref<number>(loadVolume())
    const muted = ref<boolean>(loadMuted())

    function setVolume(newVolume: number) {
        console.log('Setting volume to', newVolume)
        const clamped = Math.max(0, Math.min(1, newVolume))
        volume.value = clamped
        storeVolume(clamped)
    }

    function setMuted(newMuted: boolean) {
        muted.value = newMuted
        storeMuted(newMuted)
    }

    return {
        volume,
        setVolume,
        muted,
        setMuted,
    }
})
