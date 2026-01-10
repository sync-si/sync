import type { ClientMessage } from '@sync/wire'
import type { SyncServer, SyncWS } from '../server'
import { OWNER_HANDLERS } from './owner'
import { COMMON_HANDLERS } from './common'

export type HandlerMap = {
    [TKey in ClientMessage['type']]: (
        ws: SyncWS,
        msg: Extract<ClientMessage, { type: TKey }>,
        server: SyncServer,
    ) => void | Promise<void>
}

export const HANDLERS = {
    ...OWNER_HANDLERS,
    ...COMMON_HANDLERS,
} satisfies HandlerMap
