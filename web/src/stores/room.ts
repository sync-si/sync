import { defineStore } from 'pinia'
import { SyncSocket } from '../ws/sync-socket'
import { computed, ref } from 'vue'

import { useSessionStore, type Session } from './session'
import type {
    ChatMessage,
    ClientMessage,
    ClientMessages,
    PlaybackStats,
    RoomInfo,
    ServerMessage,
    SyncState,
    WireRoom,
    WireUser,
} from '@sync/wire/types'
import { CloseCode, CloseReason } from '@sync/wire/client'
import { parseMediaJwt, type MediaJWT } from '../util/mediajwt'

export enum RoomFailState {
    Ok = 'ok',
    Unknown = 'unknown',
    Kicked = 'kicked',
    Closed = 'closed',
    ConnectedElsewhere = 'connectedElsewhere',
    Failed = 'failed',
}

interface PromiseSource<T> {
    resolve: (value: T) => void
    reject: (reason?: unknown) => void
}

interface PingResult {
    offset: number
    latency: number
}

export const useRoomStore = defineStore('room', () => {
    const sessionStore = useSessionStore()

    const socket = ref<SyncSocket | undefined>()
    const roomFailState = ref<RoomFailState>(RoomFailState.Ok)
    const roomLoading = ref(true)
    const roomLoadingProgress = ref(0)
    const reconnectState = ref<{
        attempt: number
        timestamp: number
    }>()

    // time correction state
    const time = ref<PingResult>({ offset: 0, latency: 333 })
    let pingIntervalRef: number | undefined

    // us
    const self = ref<WireUser>()
    // info about the room
    const roomInfo = ref<RoomInfo>()
    // users in the room
    const roomUsers = ref<Map<string, WireUser>>(new Map())
    //owner
    const ownerId = ref<string>('')
    // playlist items
    const playlist = ref<MediaJWT[]>()
    // Sync state
    const syncState = ref<SyncState>({ state: 'idle' })
    // chat messages
    const chat = ref<ChatMessage[]>([])
    // struggling users
    const struggleMap = ref<Map<string, number>>(new Map())
    // playbackReports
    const playbackReports = ref<Map<string, { stats: PlaybackStats; timestamp: number }>>(new Map())

    // maps user IDs to usernames for people who disconnected
    const uidUsernameCache = ref<Map<string, string>>(new Map())

    let _msgId = 1
    const _replyPromises = new Map<number, PromiseSource<ServerMessage>>()

    async function syncTime() {
        try {
            const results: PingResult[] = []

            for (let i = 0; i < 5; i++) {
                const r = await ping()
                results.push(r)
                roomLoadingProgress.value = i + 2
            }

            results.sort((a, b) => a.latency - b.latency)

            // median of the best 3 results
            const offset = (results[0]!.offset + results[1]!.offset + results[2]!.offset) / 3
            const latency = (results[0]!.latency + results[1]!.latency + results[2]!.latency) / 3
            return { offset, latency }
        } catch {
            return { offset: 0, latency: 99999999 }
        }
    }

    function _sendAndForget<T extends keyof ClientMessages>(
        type: T,
        body: ClientMessages[T]['body'],
    ): boolean {
        console.log('[RoomStore] >', type, body ?? '')

        // @ts-expect-error Typescript is being dumb
        const msg: ClientMessage = {
            id: _msgId++,
            type,
            body,
        }

        return socket.value?.sendMessage(msg) ?? false
    }

    function _sendWithReply<T extends keyof ClientMessages>(
        type: T,
        body: ClientMessages[T]['body'],
        timeout = 5000,
    ): Promise<ServerMessage> {
        console.log('[RoomStore] >', type, body ?? '')

        // @ts-expect-error Typescript is being dumb
        const msg: ClientMessage = {
            id: _msgId++,
            type,
            body,
        }

        const replyPromise = new Promise<ServerMessage>((resolve, reject) => {
            _replyPromises.set(msg.id!, { resolve, reject })

            if (!(socket.value?.sendMessage(msg) ?? false)) {
                _replyPromises.delete(msg.id!)
                reject(new Error('Socket not connected'))
            }
        })

        const timeoutPromise = new Promise<ServerMessage>((_resolve, reject) => {
            setTimeout(() => {
                _replyPromises.delete(msg.id!)
                reject(new Error('Reply timed out'))
            }, timeout)
        })

        return Promise.race([replyPromise, timeoutPromise])
    }

    function _clearAllReplyPromises(reason: string) {
        for (const [, ps] of _replyPromises) {
            ps.reject(new Error(reason))
        }
        _replyPromises.clear()
    }

    function connect(s: Session) {
        socket.value = new SyncSocket(`/api/session/connect/${s.sessionToken}`)
        roomLoading.value = true
        socket.value.onMessage = handleMessage as (msg: unknown) => void
        socket.value.onConnected = handleConnected
        socket.value.onReconnectAttempt = handleReconnectAttempt
        socket.value.onCleanClose = handleCleanClose
        socket.value.onFailed = handleFailed
        socket.value.connect()
    }

    function handleConnected() {
        // upon successful connection, keep the session alive
        sessionStore.sessionKeepAlive()
        roomLoading.value = false
        reconnectState.value = undefined
    }

    function handleReconnectAttempt(n: number) {
        _clearAllReplyPromises('Reconnecting')
        reconnectState.value = {
            attempt: n,
            timestamp: Date.now(),
        }
    }

    function handleFailed() {
        _clearAllReplyPromises('Socket connection failed')
        roomFailState.value = RoomFailState.Failed
        window.clearInterval(pingIntervalRef)
        sessionStore.sessionDead() // forget dead session
    }

    function handleCleanClose(code: number, _reason: string) {
        _clearAllReplyPromises('Socket closed')
        window.clearInterval(pingIntervalRef)
        switch (code) {
            case CloseCode.ConnectedElsewhere:
                roomFailState.value = RoomFailState.ConnectedElsewhere
                break
            case CloseCode.Kicked:
                roomFailState.value = RoomFailState.Kicked
                sessionStore.sessionDead()
                break
            case CloseCode.RoomClosed:
                roomFailState.value = RoomFailState.Closed
                sessionStore.sessionDead()
                break
            default:
                roomFailState.value = RoomFailState.Unknown
            // do not forget session on unknown close
        }
    }

    function applyRoomUpdate(room: Partial<WireRoom>) {
        if (room.room) roomInfo.value = room.room
        if (room.users) roomUsers.value = new Map(room.users.map((u) => [u.id, u]))
        if (room.ownerId) {
            ownerId.value = room.ownerId
            // if owner changes, clear struggle map & playback reports
            playbackReports.value.clear()
            struggleMap.value.clear()
        }
        if (room.playlist) playlist.value = room.playlist.map(parseMediaJwt)
        if (room.sync) syncState.value = room.sync
        if (room.chat) chat.value = room.chat

        // update the uid-username cache
        if (room.users) {
            for (const u of room.users) {
                uidUsernameCache.value.set(u.id, u.name)
            }
        }
    }

    async function getLatencyAndGo() {
        try {
            const timeResult = await syncTime()
            time.value = timeResult
            roomLoading.value = false

            pingIntervalRef = window.setInterval(
                () => {
                    console.log('[RoomStore] Sending periodic ping')
                    ping()
                        .then(() => {
                            // keep session alive on successful ping
                            sessionStore.sessionKeepAlive()
                        })
                        .catch(() => {})
                },
                60_000 + Math.random() * 60_000,
            )
        } catch (e) {
            console.log('[RoomStore] Caught error while syncing time:', e)
            roomFailState.value = RoomFailState.Failed
        }
    }

    function handleMessage(msg: ServerMessage) {
        console.log('[RoomStore] <', msg.type, msg.body ?? '')

        if (msg.replyTo) {
            const ps = _replyPromises.get(msg.replyTo)
            if (ps) {
                ps.resolve(msg)
                _replyPromises.delete(msg.replyTo)
            }
        }

        switch (msg.type) {
            case 'roomHello': {
                applyRoomUpdate(msg.body)
                self.value = msg.body.you
                roomLoadingProgress.value = 1
                getLatencyAndGo()
                break
            }

            case 'roomUpdated': {
                applyRoomUpdate(msg.body)
                break
            }

            case 'userStruggle': {
                struggleMap.value.set(msg.body.userId, Date.now())
                break
            }

            case 'userState': {
                const user = roomUsers.value.get(msg.body.userId)
                if (user) {
                    user.state = msg.body.state
                    user.lastStateChange = msg.body.timestamp
                }
                break
            }

            case 'userJoined': {
                roomUsers.value.set(msg.body.id, msg.body)
                uidUsernameCache.value.set(msg.body.id, msg.body.name)
                break
            }

            case 'userLeft': {
                roomUsers.value.delete(msg.body.userId)
                break
            }

            case 'ssync': {
                syncState.value = msg.body
                break
            }

            case 'chatMessage': {
                chat.value.push(msg.body)
                break
            }

            case 'chatCleared': {
                chat.value = [
                    {
                        type: 'system',
                        timestamp: Date.now(),
                        text: 'Chat was cleared',
                    },
                ]
                break
            }

            case 'playbackReport': {
                playbackReports.value.set(msg.body.userId, {
                    stats: msg.body.stats,
                    timestamp: msg.body.timestamp,
                })
                break
            }

            case 'playbackQuery': {
                console.log('[RoomStore] Received playbackQuery (not handled)')
                break
            }
        }
    }

    async function ping(): Promise<PingResult> {
        const start = Date.now()
        const reply = await _sendWithReply('ping', null)
        const end = Date.now()

        if (reply.type !== 'pong') {
            throw new Error('Invalid reply to ping')
        }

        const latency = end - start
        const offsetNumber = reply.body.timestamp + latency / 2 - start

        return { offset: offsetNumber, latency }
    }

    function sync(s: SyncState) {
        _sendAndForget('sync', s)
    }

    function kickUser(userId: string) {
        _sendAndForget('kick', { userId })
    }

    function clearChat() {
        _sendAndForget('clearChat', null)
    }

    function destroyRoom() {
        _sendAndForget('destroyRoom', null)
    }

    function kickAll() {
        _sendAndForget('kickAll', null)
    }

    function promote(userId: string) {
        _sendAndForget('promote', { userId })
    }

    async function updateRoom(u: { name?: string }) {
        return await _sendWithReply('updateRoom', u)
    }

    async function updatePlaylist(newPlaylist: MediaJWT[]) {
        return await _sendWithReply(
            'updatePlaylist',
            newPlaylist.map((x) => x.token),
        )
    }

    async function deleteFromPlaylist(itemToRemove: MediaJWT) {
        return await _sendWithReply(
            'updatePlaylist',
            playlist.value!.filter((x) => x.token !== itemToRemove.token).map((x) => x.token),
        )
    }

    async function addToPlaylist(media: MediaJWT) {
        return await _sendWithReply('updatePlaylist', [
            ...(playlist.value?.map((x) => x.token) ?? []),
            media.token,
        ])
    }

    async function playAndClearPlaylist(media: MediaJWT) {
        await _sendWithReply('updatePlaylist', [media.token])
        syncState.value = { state: 'paused', position: 0, media: media.token }
        _sendAndForget('sync', syncState.value)
    }

    function queryPlayback(userId: string) {
        _sendAndForget('queryPlayback', { userId })
    }

    function sendChat(text?: string, recommendation?: string) {
        _sendAndForget('message', { text, recommendation })
    }

    function leave() {
        socket.value?.close(CloseCode.Leave, CloseReason.Leave)
        sessionStore.sessionDead() // session is killed client-side
    }

    const ownerUser = computed(() => roomUsers.value.get(ownerId.value))
    const normalUsers = computed(() =>
        Array.from(roomUsers.value.values()).filter((x) => x.id !== ownerId.value),
    )

    const activeMediaToken = computed(() => {
        if (!syncState.value) return undefined
        if (syncState.value.state === 'idle') return undefined
        return syncState.value.media
    })

    const isOwner = computed(() => {
        return self.value?.id === ownerId.value
    })

    return {
        roomLoading,
        roomLoadingProgress,
        roomFailState,
        reconnectState,
        time,
        self,
        roomInfo,
        roomUsers,
        playlist,
        syncState,
        chat,
        uidUsernameCache,
        ownerId,
        ownerUser,
        normalUsers,
        activeMediaToken,
        isOwner,

        connect,

        ping,
        sync,
        kickUser,
        clearChat,
        destroyRoom,
        kickAll,
        promote,
        updateRoom,
        deleteFromPlaylist,
        updatePlaylist,
        addToPlaylist,
        playAndClearPlaylist,
        queryPlayback,
        sendChat,
        leave,
    }
})
