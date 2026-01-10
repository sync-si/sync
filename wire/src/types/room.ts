import type { Media } from './media.js'
import type { ChatMessage } from './message.js'
import type { SyncState } from './sync.js'
import type { WireUser } from './user.js'

type RoomInfo = {
    slug: string
    name: string
}

export interface WireRoom {
    room: RoomInfo
    ownerId: string
    users: WireUser[]
    chat: ChatMessage[]
    sync: SyncState
    playlist: Media[]
}
