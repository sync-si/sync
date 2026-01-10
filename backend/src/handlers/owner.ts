import type { ClientMessages } from '@sync/wire'
import type { HandlerMap } from '.'
import type { SyncServer, SyncWS } from '../server'

export const OWNER_HANDLERS = {
    sync: (ws: SyncWS, msg: ClientMessages['sync'], server: SyncServer) => {},
    updateRoom: (ws: SyncWS, msg: ClientMessages['updateRoom'], server: SyncServer) => {},
    clearChat: (ws: SyncWS, msg: ClientMessages['clearChat'], server: SyncServer) => {},
    destroyRoom: (ws: SyncWS, msg: ClientMessages['destroyRoom'], server: SyncServer) => {},
    kick: (ws: SyncWS, msg: ClientMessages['kick'], server: SyncServer) => {},
    kickAll: (ws: SyncWS, msg: ClientMessages['kickAll'], server: SyncServer) => {},
    updatePlaylist: (ws: SyncWS, msg: ClientMessages['updatePlaylist'], server: SyncServer) => {},
    queryPlayback: (ws: SyncWS, msg: ClientMessages['queryPlayback'], server: SyncServer) => {},
} satisfies Partial<HandlerMap>
