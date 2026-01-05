import { beforeAll, describe, expect, test } from "bun:test";
import { startWebSocketServer } from "../src/WebSocketServer.ts";
import {RoomManager} from "../src/app/services";

beforeAll(() => {
    startWebSocketServer();
    RoomManager.createRoom("test-room")
});

describe("WebSocket", () => {
    test("connection", done => {
        const client: WebSocket = new WebSocket("ws://localhost:3001/api/v1/connect/test-room");
        client.onopen = () => {
            client.close();
            done();
        };
        client.onerror = error => {
            expect(error).toBeNull()
            done();
        }
    });

    test("join", done => {
        const client: WebSocket = new WebSocket("ws://localhost:3001/api/v1/connect/test-room");
        const messageID = crypto.randomUUID();
        client.onopen = () => {
            client.send(JSON.stringify({
                messageID: messageID,
                payloadID: "https://sync.si/schemas/event/clientJoin",
                payload: {
                    displayName: "John Doe",
                    email: "john.doe@example.com"
                }
            }));
        }

        client.onmessage = message => {
            expect(JSON.parse(message.data)).toMatchObject({
                payloadID: "https://sync.si/schemas/event/joinReply",
                replyTo: messageID,
                payload: {
                    displayName: "John Doe",
                    gravatarHash: "836f82db99121b3481011f16b49dfa5fbc714a0d1b1b9f784a1ebbbf5b39577f"
                }
            });
            client.close();
            done();
        }
    });

    test("message-before-join", done => {
        const client: WebSocket = new WebSocket("ws://localhost:3001/api/v1/connect/test-room");
        const messageID = crypto.randomUUID();
        client.onopen = () => {
            client.send(JSON.stringify({
                messageID: messageID,
                payloadID: "https://sync.si/schemas/chat/clientChat",
                payload: {
                    rawMessage: "Hello World!"
                }
            }))
        }

        client.onclose = event => {
            expect(event.code).toBe(1002);
            expect(event.reason).toBe("You must first identify yourself with a clientJoin message, before sending anything else!")
            done();
        }
    })
});