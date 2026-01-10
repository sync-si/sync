import type { WireUser } from '@sync/wire/types'
import { defineStore } from 'pinia'
import { readonly, ref } from 'vue'
import type { Result } from '../util/result'

const SESSION_LIFETIME = 30_000 // TODO: @sync/wire constants
const SESSION_KILL = 300_000 // how long until we delete old sessions from localStorage

interface LSession {
    version: number
    roomSlug: string
    token: string
    lastValidTime: number
}

const KEY_PREFIX = 'sync3-session:'
const VERSION = 1

function isLSession(obj: unknown): obj is LSession {
    if (typeof obj !== 'object' || obj === null) return false

    if (!('version' in obj) || obj.version !== VERSION) return false
    if (!('roomSlug' in obj) || typeof obj.roomSlug !== 'string') return false
    if (!('createTime' in obj) || typeof obj.createTime !== 'number') return false
    if (!('token' in obj) || typeof obj.token !== 'string') return false

    return true
}

function cleanupOldSessions() {
    const lskeys = Object.keys(localStorage).filter((k) => k.startsWith(KEY_PREFIX))
    const now = Date.now()

    let n = 0

    for (const key of lskeys) {
        try {
            const data = JSON.parse(localStorage.getItem(key)!)

            if (!isLSession(data)) {
                localStorage.removeItem(key)
                n++
                continue
            }

            if (now - data.lastValidTime > SESSION_KILL) {
                localStorage.removeItem(key)
                n++
            }
        } catch {
            localStorage.removeItem(key)
            n++
        }
    }

    console.log(`[SessionStore] Cleaned up ${n} old sessions`)
}

function readSession(roomSlug: string): Session | null {
    try {
        const data = JSON.parse(localStorage.getItem(KEY_PREFIX + roomSlug)!)
        if (!isLSession(data)) {
            return null
        }

        return {
            type: Date.now() - data.lastValidTime > SESSION_LIFETIME ? 'maybeExpired' : 'stored',
            roomSlug,
            sessionToken: data.token,
            lastValidTime: data.lastValidTime,
        }
    } catch {
        return null
    }
}

function storeSession(session: Session) {
    const data: LSession = {
        version: VERSION,
        roomSlug: session.roomSlug,
        token: session.sessionToken,
        lastValidTime: session.lastValidTime,
    }

    localStorage.setItem(KEY_PREFIX + session.roomSlug, JSON.stringify(data))
}

interface Session {
    type: 'fresh' | 'stored' | 'maybeExpired'
    roomSlug: string
    sessionToken: string
    lastValidTime: number
}

type CreateRoomResponse = {
    roomSlug: string
    sessionToken: string

    you: WireUser
}

export const useSessionStore = defineStore('session', () => {
    cleanupOldSessions()

    const activeSession = ref<Session | null>(null)

    function getSession(roomSlug: string): Session | null {
        return readSession(roomSlug)
    }

    async function createRoom(
        roomName: string,
        roomSlug: string,

        displayName: string,
        gravatarHash: string,
    ): Promise<Result<Session>> {
        const response = await fetch('/api/room/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                roomName,
                roomSlug,
                displayName,
                gravatarHash,
            }),
        })

        if (!response.ok) {
            return { success: false, error: await response.text() }
        }

        const data = (await response.json()) as CreateRoomResponse

        return {
            success: true,
            data: {
                type: 'fresh',
                roomSlug: data.roomSlug,
                sessionToken: data.sessionToken,
                lastValidTime: Date.now(),
            } satisfies Session,
        }
    }

    async function joinRoom(
        roomSlug: string,

        displayName: string,
        gravatarHash: string,
    ) {
        const response = await fetch('/api/room/join', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                roomSlug,
                displayName,
                gravatarHash,
            }),
        })

        if (!response.ok) {
            return { success: false, error: await response.text() }
        }

        const data = (await response.json()) as CreateRoomResponse

        return { success: true, data }
    }

    function activateSession(session: Session) {
        activeSession.value = session
    }

    function sessionKeepAlive() {
        if (activeSession.value) {
            activeSession.value.lastValidTime = Date.now()
            storeSession(activeSession.value)
        }
    }

    function sessionDead(): void {
        if (!activeSession.value) return

        localStorage.removeItem(KEY_PREFIX + activeSession.value.roomSlug)
        activeSession.value = null
    }

    return {
        activeSession: readonly(activeSession),

        getSession,
        activateSession,

        createRoom,
        joinRoom,

        sessionKeepAlive,
        sessionDead,
    }
})
