import type { ClientMessages, UserMessage } from '@sync/wire'
import type { HandlerMap } from '.'
import type { SyncServer, SyncWS } from '../server'
import { serializeMsg } from '@sync/wire/backend'
import { MediaManager } from '../services/MediaManager'
import { notOwnerGuard } from '../util/guards'
import { reply, replyError } from '../util/msg'

export const COMMON_HANDLERS = {
    ping: (ws: SyncWS, msg: ClientMessages['ping']) => {
        reply(ws, msg, 'pong', {
            timestamp: Date.now(),
        })
    },

    struggle: (ws: SyncWS, msg: ClientMessages['struggle']) => {
        const me = ws.data.user
        const owner = me.room.owner
        if (!owner) return

        if (notOwnerGuard(ws, msg)) return

        // TODO: Rate limit.

        ws.data.user.room.owner?.webSocket?.send(
            serializeMsg('userStruggle', { userId: ws.data.user.id }),
        )
    },

    message: async (ws: SyncWS, msg: ClientMessages['message'], server: SyncServer) => {
        let text = msg.body.text?.trim()
        if (text?.length === 0) text = undefined

        //TODO: Rate limit

        if (!text && !msg.body.recommendation) {
            replyError(ws, msg, {
                type: 'invalidChatMessage',
                message: 'Message must contain text or a media recommendation.',
            })
            return
        }

        const recommendation = msg.body.recommendation

        if (recommendation && !(await MediaManager.getMediaJwt(recommendation))) {
            replyError(ws, msg, {
                type: 'invalidMedia',
                message: 'The recommended media is invalid.',
            })
            return
        }

        const cmsg: UserMessage = {
            type: 'user',
            userId: ws.data.user.id,
            timestamp: Date.now(),
            text,
            recommendation: msg.body.recommendation,
        }

        ws.data.user.room.addMessage(cmsg)
        server.publish(ws.data.user.room.topic, serializeMsg('chatMessage', cmsg))
    },

    playbackStats: (ws: SyncWS, msg: ClientMessages['playbackStats']) => {
        const me = ws.data.user
        const owner = me.room.owner

        if (!owner) return

        if (notOwnerGuard(ws, msg)) return

        // TODO: Rate limit.

        ws.data.user.room.owner?.webSocket?.send(
            serializeMsg('playbackReport', {
                userId: ws.data.user.id,
                stats: msg.body,
                timestamp: Date.now(),
            }),
        )
    },
} satisfies Partial<HandlerMap>
