import { Elysia, t } from 'elysia'
import { Room, User } from './models'
import { RoomManager } from './services/RoomManager'
import { SessionManager } from './services/SessionManager'
import { CloseCode, CloseReason, serializeMsg } from '@sync/wire/backend'

export type WSData = {
    user: User
}

export type SyncWS = Bun.ServerWebSocket<WSData>

const app = new Elysia()
    .post('/room/canCreate/:id', ({ params: { id }, status }) => {
        if (!Room.isValidSlug(id)) {
            return status(400)
        }

        if (RoomManager.getRoom(id)) {
            return status(409)
        }

        return status(200)
    })
    .post(
        '/room/create',
        ({ body, status }) => {
            const error =
                User.check(body.displayName, body.gravatarHash) ??
                Room.check(body.roomSlug, body.roomName)

            if (error) {
                return status(400, error)
            }

            if (RoomManager.getRoom(body.roomSlug)) {
                return status(409, 'Room already exists')
            }

            const r = RoomManager.createRoom(body.roomSlug, body.roomName.trim())
            const u = new User(r, body.displayName.trim(), body.gravatarHash)
            SessionManager.register(u)

            r.addUser(u)

            return {
                roomSlug: r.slug,
                sessionID: u.sessionId,

                you: u.toWire(),
            }
        },
        {
            body: t.Object({
                roomName: t.String(),
                roomSlug: t.String(),
                displayName: t.String(),
                gravatarHash: t.Optional(t.String()),
            }),
        },
    )
    .post(
        '/room/join',
        ({ body, status }) => {
            const error = User.check(body.displayName, body.gravatarHash)

            if (error) {
                return status(400, error)
            }

            const room = RoomManager.getRoom(body.roomSlug)
            if (!room) {
                return status(404, 'Room not found')
            }

            const u = new User(room, body.displayName.trim(), body.gravatarHash)
            SessionManager.register(u)

            return {
                roomSlug: room.slug,
                sessionID: u.sessionId,

                you: u.toWire(),
            }
        },
        {
            body: t.Object({
                roomSlug: t.String(),

                displayName: t.String(),
                gravatarHash: t.Optional(t.String()),
            }),
        },
    )
    .post('/media/check', (req) => {}, {
        body: t.Object({}),
    })

export const server = Bun.serve({
    fetch: app.handle.bind(app),
    routes: {
        '/session/connect/:token': (req, srv) => {
            const token: string = req.params.token
            const session = SessionManager.get(token)

            if (!session) {
                return new Response('Invalid session token', { status: 401 })
            }

            if (srv.upgrade(req, { data: { user: session } })) {
                return
            }

            return new Response('Upgrade failed', { status: 400 })
        },
    },
    websocket: {
        data: {} as WSData,

        open: (ws) => {
            const { user } = ws.data

            console.log(`[${user.room.slug}:${user.displayName}] Open`)

            user.state = 'present'
            user.lastStateChangeTimestamp = Date.now()

            if (user.webSocket) {
                user.webSocket.close(CloseCode.ConnectedElsewhere, CloseReason.ConnectedElsewhere)
                user.webSocket = ws
            } else {
                server.publish(
                    user.room.topic,
                    serializeMsg('userState', { userId: user.id, state: 'present' }),
                )
            }

            user.webSocket = ws
            ws.subscribe(user.room.topic)

            //TODO: Send hello
            ws.send(serializeMsg('roomHello', { you: user.toWire(), ...user.room.toWire() }))
        },

        message: (ws, msg) => {},

        close: (ws, code, reason) => {
            const { user } = ws.data

            console.log(`[${user.room.slug}:${user.displayName}] Close: ${code} (${reason})`)

            if (code === CloseCode.ConnectedElsewhere) return

            if (code === CloseCode.Leave) {
                user.room.removeUser(user)

                server.publish(user.room.topic, serializeMsg('userLeft', { userId: user.id }))

                return
            } else {
                user.state = 'reconnecting'
                user.lastStateChangeTimestamp = Date.now()

                server.publish(
                    user.room.topic,
                    serializeMsg('userState', { userId: user.id, state: 'disconnected' }),
                )
            }

            user.state = 'reconnecting'
            user.lastStateChangeTimestamp = Date.now()
        },
    },
})
