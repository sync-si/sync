import type { SyncError } from './error.js'
import type { ChatMessage } from './message.js'
import type { WireRoom } from './room.js'
import type { PlaybackStats, SyncState } from './sync.js'
import type { WireUser, WireUserState } from './user.js'

export interface SyncMsg<Tkey extends string, TBody> {
    id?: number
    replyTo?: number
    type: Tkey
    body: TBody
}

export interface ServerMsgMap {
    roomHello: WireRoom & { you: WireUser }
    roomUpdated: Partial<WireRoom>

    pong: { timestamp: number }

    ssync: SyncState

    chatMessage: ChatMessage
    chatCleared: null

    userJoined: WireUser
    userLeft: { userId: string }
    userState: { userId: string; timestamp: number; state: WireUserState }

    playbackQuery: null
    playbackReport: { userId: string; stats: PlaybackStats }

    userStruggle: { userId: string }

    error: SyncError
}

export type ServerMessages = {
    [K in keyof ServerMsgMap]: SyncMsg<K, ServerMsgMap[K]>
}

export type ServerMessage = ServerMessages[keyof ServerMessages]
export type { ClientMsgMap, ClientMessages, ClientMessage } from '../backend/index.js'
