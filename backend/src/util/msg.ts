import type { ClientMessage, ServerMessage, SyncError, SyncMsg } from '@sync/wire'
import { serializeMsg, type BodyTypeFromKey } from '@sync/wire/backend'
import type { SyncServer, SyncWS } from '../server'

export function replyError(ws: SyncWS, msg: SyncMsg<string, any>, err: SyncError) {
    ws.send(
        serializeMsg(
            'error',
            {
                ...err,
                cause: msg.type,
            },
            msg.id,
        ),
    )
}

export function replyOk(ws: SyncWS, msg: SyncMsg<string, any>) {
    ws.send(serializeMsg('ok', null, msg.id))
}

export function broadcast<T extends ServerMessage['type']>(
    server: SyncServer,
    ws: SyncWS,
    replyType: T,
    replyBody: BodyTypeFromKey<T>,
) {
    server.publish(ws.data.user.room.topic, serializeMsg(replyType, replyBody))
}

export function reply<T extends ServerMessage['type']>(
    ws: SyncWS,
    msg: ClientMessage,
    replyType: T,
    replyBody: BodyTypeFromKey<T>,
) {
    ws.send(serializeMsg(replyType, replyBody, msg.id))
}
