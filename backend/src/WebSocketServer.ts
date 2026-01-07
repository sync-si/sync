import { Value } from 'typebox/value'
import {
    type UserSchemaType,
    UserValidator,
    type WSMessageType,
    WSMessageValidator,
} from './app/schemas'
import { toWSMessage, ErrorDTO, LeaveDTO } from './app/dto'
import { ChatService, StateService, RoomManager, SessionManager, PingService } from './app/services'
import { Room, User } from './app/models'

export type WebSocketData = {
    user: User
}

export const HANDLER_REGISTRY: Record<
    string,
    (ws: Bun.ServerWebSocket<WebSocketData>, message: any) => void
> = {}

/**
 * Starts the WebSocket server
 */
export function startWebSocketServer(): Bun.Server<WebSocketData> {
    const server = Bun.serve({
        port: 3001,
        async fetch() {
            return new Response(
                `Hello from Sync.si WebSocket server! What are you doing here? There is nothing here, go away.`,
                { status: 418, statusText: "I'm a teapot" },
            )
        },

        routes: {
            '/v1/room/:id/join': {
                POST: async (request) => {
                    const id: string = request.params.id
                    const room: Room | undefined = RoomManager.getRoom(id)
                    if (!room) {
                        return Response.json({ error: 'Room not found' }, { status: 404 })
                    }
                    // Check headers
                    if (request.headers.get('Content-Type') !== 'application/json') {
                        return Response.json({ error: 'Unsupported Media Type' }, { status: 415 })
                    }
                    // Parse body
                    let body: unknown
                    try {
                        body = await request.json()
                    } catch (e) {
                        return Response.json({ error: e }, { status: 400 })
                    }
                    // Check body
                    if (!UserValidator.Check(body)) {
                        let errors = UserValidator.Errors(body)
                        const errorsWithValue = errors.map((error) => {
                            return { ...error, value: Value.Pointer.Get(body, error.instancePath) }
                        })
                        return Response.json({ errors: errorsWithValue }, { status: 400 })
                    }
                    // Create user
                    const validBody = body as UserSchemaType
                    const user: User = new User(room, validBody.displayName, validBody.gravatarHash)
                    SessionManager.register(user)

                    return Response.json(
                        {
                            sessionID: user.sessionId,
                            roomID: room.slug,
                            userID: user.id,
                        },
                        {
                            status: 201,
                            headers: {
                                Location: `/v1/connect/${user.sessionId}`,
                            },
                        },
                    )
                },
            },
            '/v1/connect/:id': {
                GET: (request) => {
                    const sessionID = request.params.id
                    if (!SessionManager.has(sessionID)) {
                        return Response.json({ error: 'Session not found' }, { status: 404 })
                    }
                    const user: User = <User>SessionManager.get(sessionID)
                    const upgrade = server.upgrade(request, {
                        data: {
                            roomChannel: `room:${user.room?.slug}`,
                            user: user,
                        } as WebSocketData,
                    })
                    if (!upgrade) {
                        return Response.json(
                            { error: 'Failed to upgrade to WebSocket' },
                            { status: 500 },
                        )
                    }
                },
            },
        },

        websocket: {
            data: {} as WebSocketData,

            async open(ws) {
                //TODO: Greet user

                ws.subscribe(ws.data.user.room.topic)
            },

            async message(ws, message: string | Buffer<ArrayBuffer>): Promise<void> {
                let stringMessage = JSON.parse(message.toString())
                // First validate the message structure
                let validatedMessage: WSMessageType
                try {
                    validatedMessage = WSMessageValidator.Parse(stringMessage) as WSMessageType
                } catch (error) {
                    let errors = WSMessageValidator.Errors(stringMessage)
                    const errorsWithValue = errors.map((error) => {
                        return {
                            ...error,
                            value: Value.Pointer.Get(validatedMessage, error.instancePath),
                        }
                    })
                    ws.send(
                        JSON.stringify(
                            toWSMessage(
                                new ErrorDTO(
                                    1,
                                    `Invalid message format:\n${errorsWithValue
                                        .map((error) => JSON.stringify(error))
                                        .join('\n')}`,
                                ),
                                stringMessage.messageID || '',
                            ),
                        ),
                    )
                    return
                }
                // Then handle the message based on its payloadID
                const payloadID: string = validatedMessage.payloadID
                if (!(payloadID in HANDLER_REGISTRY)) {
                    ws.send(
                        JSON.stringify(
                            toWSMessage(
                                new ErrorDTO(2, `Unknown payloadID: ${validatedMessage.payloadID}`),
                                validatedMessage.messageID || '',
                            ),
                        ),
                    )
                    return
                }
                HANDLER_REGISTRY[payloadID]?.(ws, validatedMessage)
            },

            async close(ws) {
                ws.publish(
                    ws.data.user.room.topic,
                    JSON.stringify(toWSMessage(new LeaveDTO(ws.data.user.id, 'disconnect'))),
                )
            },
        },
    })

    // Start services
    ChatService.start()
    PingService.start()
    StateService.start()

    console.log(`WebSocket server running at ${server.url}`)

    return server
}
