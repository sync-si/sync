import {Value} from "typebox/value";
import {type UserSchemaType, UserValidator, type WSMessageType, WSMessageValidator} from "./app/schemas";
import {toWSMessage, ErrorDTO, LeaveDTO, type ClientID} from "./app/dto";
import {JoinService, ChatService, StateService, RoomManager, SessionManager, PingService} from "./app/services";
import {Room, Session, User} from "./app/models";
import {createHash} from "crypto";

export type WebSocketData = {
    roomSlug: string;
    room: Room;
    user: User;
    clientID: ClientID;
}

export const HANDLER_REGISTRY: Record<string, (ws: Bun.ServerWebSocket<WebSocketData>, message: any) => void> = {}

function getGravatarHash(email: string): string {
    email = email.trim().toLowerCase();
    return createHash('sha256').update(email).digest('hex');
}

/**
 * Starts the WebSocket server
 */
export function startWebSocketServer(): Bun.Server<WebSocketData> {
    const server = Bun.serve({
        port: 3001,
        async fetch(request: Request) {
            const path = new URL(request.url).pathname;

            // WebSocket upgrade for /api/v1/connect/:roomSlug
            if (path.startsWith('/api/v1/connect/')) {
                const roomSlug = path.split("/").pop();
                const room = RoomManager.getRoom(roomSlug!);
                if (!room) {
                    return new Response("Room not found", {status: 404});
                }
                let upgrade = server.upgrade(request, {
                    data: {
                        roomSlug: `room:${roomSlug}`,
                        room: room,
                        clientID: crypto.randomUUID()
                    } as WebSocketData
                });
                if (!upgrade) {
                    return new Response("Failed to upgrade to WebSocket", {status: 500});
                }
                return;
            }

            return new Response(`Hello from Sync.si WebSocket server! What are you doing here? There is nothing here, go away.`
                , {status:418, statusText: "I'm a teapot"});
        },

        routes: {
            "/room/:id/join": {
                POST: async request => {
                    const id: string = request.params.id;
                    const room: Room | undefined = RoomManager.getRoom(id);
                    if (!room) {
                        return new Response(JSON.stringify({ error: "Room not found" }), {
                            status: 404,
                            headers: { "Content-Type": "application/json" }
                        });
                    }
                    // Check headers
                    if (request.headers.get("Content-Type") !== "application/json") {
                        return new Response(JSON.stringify({ error: "Unsupported Media Type" }), {
                            status: 415,
                            statusText: "Unsupported Media Type",
                            headers: { "Content-Type": "application/json" }
                        });
                    }
                    // Parse body
                    let body: unknown;
                    try {
                        body = await request.json();
                    } catch (e) {
                        return new Response(JSON.stringify({ error: e }), {
                            status: 400,
                            headers: { "Content-Type": "application/json" }
                        });
                    }
                    // Check body
                    if (!UserValidator.Check(body)) {
                        let errors = UserValidator.Errors(body);
                        const errorsWithValue = errors.map(error => {
                            return { ...error,
                                value: Value.Pointer.Get(body, error.instancePath)
                            }
                        });
                        return new Response(JSON.stringify({ errors: errorsWithValue }), {
                            status: 400
                        });
                    }
                    // Create user
                    const validBody = body as UserSchemaType;
                    const user: User = new User(validBody.displayName, getGravatarHash(validBody.email));
                    room.addUser(user);
                    const session: Session = SessionManager.createSession(room, user);
                    return new Response(JSON.stringify(session), {
                        status:201,
                        headers: {
                            "Content-Type": "application/json",
                            "Location": `https://api.sync.si/v1/connect/${session.id}`,
                        }
                    });
                }
            },
            "/connect/:id": {
                GET: request => {
                    const sessionID = request.params.id;
                    if (!SessionManager.has(sessionID)) {
                        return new Response("User not found!", {status: 404});
                    }

                }
            },

        },

        websocket: {
            data: {} as WebSocketData,

            async open(ws) {
                ws.subscribe(ws.data.roomSlug);
            },

            async message(ws, message: string | Buffer<ArrayBuffer>): Promise<void> {
                let stringMessage = JSON.parse(message.toString());
                // First validate the message structure
                if (!WSMessageValidator.Check(message)) {
                    let errors = WSMessageValidator.Errors(stringMessage);
                    const errorsWithValue = errors.map(error => {
                        return { ...error,
                            value: Value.Pointer.Get(validatedMessage, error.instancePath)
                        }
                    });
                    ws.send(JSON.stringify(toWSMessage(
                        new ErrorDTO(1, `Invalid message format:\n${errorsWithValue
                            .map(error => JSON.stringify(error)).join("\n")}`),
                        stringMessage.messageID || ""
                    )));
                    return;
                }
                const validatedMessage = stringMessage as WSMessageType;
                // Then handle the message based on its payloadID
                const payloadID: string = validatedMessage.payloadID;
                if (!(payloadID in HANDLER_REGISTRY)) {
                    ws.send(JSON.stringify(toWSMessage(
                        new ErrorDTO(2, `Unknown payloadID: ${validatedMessage.payloadID}`),
                        validatedMessage.messageID || ""
                    )));
                    return;
                }
                if (!ws.data.user && payloadID !== JoinService.JOIN_PAYLOAD_ID) {
                    ws.close(1002, "You must first identify yourself with a clientJoin message, before sending anything else!");
                    return;
                }
                HANDLER_REGISTRY[payloadID]?.(ws, validatedMessage);
            },

            async close(ws) {
                ws.publish(ws.data.roomSlug, JSON.stringify(toWSMessage(new LeaveDTO(ws.data.clientID, "disconnect"))));
            }
        }
    });

    // Start services
    JoinService.start();
    ChatService.start();
    PingService.start();
    StateService.start();

    console.log(`WebSocket server running at ${server.url}`);

    return server;
}