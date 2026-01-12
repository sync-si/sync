import { Elysia, t } from 'elysia'
import { Room, User } from './models'
import { RoomManager } from './services/RoomManager'
import { SessionManager } from './services/SessionManager'
import {
    CloseCode,
    CloseReason,
    MalformedMsgError,
    parseMessage,
    serializeMsg,
    type ClientMessage,
} from '@sync/wire/backend'
import { HANDLERS } from './handlers'
import { REAPER_INTERVAL_MS } from './constants'
import { reap } from './reaper'
import { MediaManager, MediaValidationError } from './services/MediaManager'

export type WSData = {
    user: User
    closedByServer?: boolean
}

export type SyncWS = Bun.ServerWebSocket<WSData>
export type SyncServer = Bun.Server<WSData>

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
                sessionId: u.sessionId,

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
        '/room/:roomId/info',
        ({ params, status }) => {
            const room = RoomManager.getRoom(params.roomId)

            if (!room) return status(404)

            return {
                name: room.name,
                /* TODO: we could pass the array of users here */
            }
        },
        {
            params: t.Object({
                roomId: t.String(),
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
                sessionId: u.sessionId,

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
    .post(
        '/media/check',
        async ({ body, status, headers }) => {
            const s = SessionManager.authenticateFromHeader(headers.authorization)

            if (!s) {
                return status(401)
            }

            try {
                const media = await MediaManager.verifyMedia(body.source)
                return { media }
            } catch (e) {
                if (e instanceof MediaValidationError) {
                    return status(400, {
                        type: e.type,
                        message: e.message,
                    })
                } else {
                    return status(500, { type: 'ise', message: 'Internal server error' })
                }
            }
        },
        {
            body: t.Object({
                source: t.String({ format: 'uri' }),
            }),
            headers: t.Object({
                authorization: t.Optional(t.String()),
            }),
        },
    )

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

            const pstate = user.state
            // Set the user as present
            user.state = 'present'
            user.lastStateChangeTimestamp = Date.now()

            if (user.webSocket) {
                ws.data.closedByServer = true
                user.webSocket.close(CloseCode.ConnectedElsewhere, CloseReason.ConnectedElsewhere)
                user.webSocket = ws
            } else {
                server.publish(
                    user.room.topic,
                    pstate === 'new'
                        ? serializeMsg('userJoined', user.toWire())
                        : serializeMsg('userState', {
                              userId: user.id,
                              timestamp: Date.now(),
                              state: 'present',
                          }),
                )
            }

            // Hello the new connection
            user.webSocket = ws
            ws.subscribe(user.room.topic)
            ws.send(serializeMsg('roomHello', { you: user.toWire(), ...user.room.toWire() }))
        },

        message: async (ws, msg) => {
            if (typeof msg !== 'string') {
                ws.send(serializeMsg('error', { type: 'binaryData', message: 'No buffers pls' }))
                return
            }

            let parsedMsg: ClientMessage

            try {
                parsedMsg = parseMessage(msg)
            } catch (e: unknown) {
                let errorMsg = 'Unknown error',
                    replyTo: number | undefined = undefined

                if (e instanceof MalformedMsgError) {
                    errorMsg = e.message
                    replyTo = e.messageId
                }

                ws.send(serializeMsg('error', { type: 'malformedMsg', message: errorMsg }, replyTo))
                return
            }

            const handler = HANDLERS[parsedMsg.type]

            if (!handler) {
                ws.send(
                    serializeMsg(
                        'error',
                        { type: 'nobodyCared', message: `Who? Asked`, cause: parsedMsg.type },
                        parsedMsg.id,
                    ),
                )
                return
            }

            try {
                await handler(ws, parsedMsg as never, server)
            } catch (e) {
                console.error('Error handling message:', e)

                ws.send(
                    serializeMsg(
                        'error',
                        {
                            type: 'serverError',
                            message: 'Server error while handling message',
                            cause: parsedMsg.type,
                        },
                        parsedMsg.id,
                    ),
                )
            }
        },

        close: (ws, code, reason) => {
            const { user } = ws.data

            console.log(`[${user.room.slug}:${user.displayName}] Close: ${code} (${reason})`)

            // When setting closedByServer, we don't want to run the normal close logic
            if (ws.data.closedByServer) {
                ws.data.closedByServer = false // ???
                console.log('[WebSocket] Closed by server, skipping close handling')
                return
            }

            if (code === CloseCode.Leave) {
                // User intentionally left
                user.room.removeUser(user, (ownerId) => {
                    server.publish(user.room.topic, serializeMsg('roomUpdated', { ownerId }))
                })
                SessionManager.destroy(user.sessionId)
                user.webSocket = undefined

                server.publish(user.room.topic, serializeMsg('userLeft', { userId: user.id }))
                console.log(`[${user.room.slug}:${user.displayName}] Leave ${code} (${reason})`)

                return
            }

            // User disconnected unexpectedly (or wrongly)
            user.state = 'reconnecting'
            user.lastStateChangeTimestamp = Date.now()
            console.log('[WebSocket] updating userstate')

            server.publish(
                user.room.topic,
                serializeMsg('userState', {
                    userId: user.id,
                    timestamp: Date.now(),
                    state: 'disconnected',
                }),
            )
            // The user will either reconnect or be reapt
        },
    },
})

setInterval(() => {
    reap(server)
}, REAPER_INTERVAL_MS)
