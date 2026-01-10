import type { ClientMessages } from '@sync/wire'
import type { HandlerMap } from '.'
import type { SyncServer, SyncWS } from '../server'
import { CloseCode, CloseReason, serializeMsg } from '@sync/wire/backend'
import { Room } from '../models'
import { SessionManager } from '../services/SessionManager'
import { RoomManager } from '../services/RoomManager'
import { notSelfGuard, ownerGuard, targetUserExistsGuard } from '../util/guards'
import { broadcast, reply, replyError, replyOk } from '../util/msg'

export const OWNER_HANDLERS = {
    sync: (ws: SyncWS, msg: ClientMessages['sync'], server: SyncServer) => {
        if (ownerGuard(ws, msg)) return

        const room = ws.data.user.room

        room.setSync(msg.body)

        broadcast(server, ws, 'ssync', msg.body)
    },

    updateRoom: (ws: SyncWS, msg: ClientMessages['updateRoom'], server: SyncServer) => {
        if (ownerGuard(ws, msg)) return

        const room = ws.data.user.room

        let changed = false

        if (msg.body.name) {
            if (Room.checkName) {
                const nameError = Room.checkName(msg.body.name)

                if (nameError) {
                    return replyError(ws, msg, {
                        type: 'badRoomUpdate',
                        message: nameError,
                    })
                }
            }

            room.name = msg.body.name.trim()
            changed = true
        }

        replyOk(ws, msg)

        if (changed) {
            broadcast(server, ws, 'roomUpdated', { room: { name: room.name, slug: room.slug } })
        }
    },

    clearChat: (ws: SyncWS, msg: ClientMessages['clearChat'], server: SyncServer) => {
        if (ownerGuard(ws, msg)) return

        const room = ws.data.user.room

        room.chat.length = 0

        broadcast(server, ws, 'chatCleared', null)
    },

    destroyRoom: (ws: SyncWS, msg: ClientMessages['destroyRoom']) => {
        if (ownerGuard(ws, msg)) return

        const room = ws.data.user.room

        for (const user of room.users.values()) {
            if (!user.webSocket) continue

            user.webSocket.data.closedByServer = true
            user.webSocket.close(CloseCode.RoomClosed, CloseReason.RoomClosed)
            user.webSocket = undefined
            SessionManager.destroy(user.sessionId)
        }

        room.users.clear()
        RoomManager.deleteRoom(room.slug)
    },

    promote: (ws: SyncWS, msg: ClientMessages['promote'], server: SyncServer) => {
        if (ownerGuard(ws, msg)) return
        if (notSelfGuard(ws, msg)) return
        if (targetUserExistsGuard(ws, msg)) return

        const room = ws.data.user.room

        const targetUser = room.users.get(msg.body.userId)
        if (!targetUser) return // TODO: Assert/errror/...

        room.promote(targetUser)

        broadcast(server, ws, 'roomUpdated', { ownerId: targetUser.id })
    },

    kick: (ws: SyncWS, msg: ClientMessages['kick'], server: SyncServer) => {
        if (ownerGuard(ws, msg)) return
        if (notSelfGuard(ws, msg)) return
        if (targetUserExistsGuard(ws, msg)) return

        const room = ws.data.user.room

        const targetUser = room.users.get(msg.body.userId)

        if (!targetUser) return // TODO: Assert/errror/...

        if (targetUser.webSocket) {
            targetUser.webSocket.data.closedByServer = true
            targetUser.webSocket.close(CloseCode.Kicked, CloseReason.Kicked)
            targetUser.webSocket = undefined
        }

        room.removeUser(targetUser, () => {})
        SessionManager.destroy(targetUser.sessionId)

        broadcast(server, ws, 'userLeft', { userId: targetUser.id })
    },

    kickAll: (ws: SyncWS, msg: ClientMessages['kickAll']) => {
        if (ownerGuard(ws, msg)) return

        const room = ws.data.user.room

        for (const user of room.users.values()) {
            if (!user.webSocket || user.webSocket === ws) continue

            user.webSocket.data.closedByServer = true
            user.webSocket.close(CloseCode.Kicked, CloseReason.Kicked)
            user.webSocket = undefined
            SessionManager.destroy(user.sessionId)
        }

        room.users.clear()
        room.users.set(ws.data.user.id, ws.data.user)

        reply(ws, msg, 'roomUpdated', { users: [ws.data.user.toWire()] })
    },

    updatePlaylist: (ws: SyncWS, msg: ClientMessages['updatePlaylist'], server: SyncServer) => {
        if (ownerGuard(ws, msg)) return

        const room = ws.data.user.room

        const error = room.updatePlaylist(msg.body)

        if (error) {
            return replyError(ws, msg, {
                type: 'badPlaylist',
                message: error,
            })
        }

        replyOk(ws, msg)
        broadcast(server, ws, 'roomUpdated', { playlist: room.playlist })
    },

    queryPlayback: (ws: SyncWS, msg: ClientMessages['queryPlayback']) => {
        if (ownerGuard(ws, msg)) return
        if (notSelfGuard(ws, msg)) return
        if (targetUserExistsGuard(ws, msg)) return

        const room = ws.data.user.room
        const targetUser = room.users.get(msg.body.userId)

        targetUser?.webSocket?.send(serializeMsg('playbackQuery', null))
    },
} satisfies Partial<HandlerMap>
