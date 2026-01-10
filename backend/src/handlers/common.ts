import type { ClientMessages } from '@sync/wire'
import type { HandlerMap } from '.'
import type { SyncServer, SyncWS } from '../server'

export const COMMON_HANDLERS = {
    ping: (ws: SyncWS, msg: ClientMessages['ping'], server: SyncServer) => {},
    struggle: (ws: SyncWS, msg: ClientMessages['struggle'], server: SyncServer) => {},
    message: (ws: SyncWS, msg: ClientMessages['message'], server: SyncServer) => {},
    playbackStats: (ws: SyncWS, msg: ClientMessages['playbackStats'], server: SyncServer) => {},
} satisfies Partial<HandlerMap>
