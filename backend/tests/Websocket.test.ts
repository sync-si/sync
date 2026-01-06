import { beforeAll, describe, expect, test } from "bun:test";
import { startWebSocketServer } from "../src/WebSocketServer.ts";
import {RoomManager} from "../src/app/services";

/**
 * Creates a new user with the specified data in `test-room` room
 * @param name The name
 * @param email The email
 * @returns The WebSocket
 */
async function openSocket(name: string, email: string): Promise<WebSocket> {
    const joinResponse: Response = await fetch("http://localhost:3001/v1/room/test-room/join", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            displayName: name,
            email: email
        })
    });
    const data: any = await joinResponse.json();
    const sessionID: string = data.sessionID;

    return new WebSocket(`ws://localhost:3001/v1/connect/${sessionID}`);
}

beforeAll(() => {
    startWebSocketServer();
    RoomManager.createRoom("test-room")
});

test("connection", async done => {
    const joinResponse: Response = await fetch("http://localhost:3001/v1/room/test-room/join", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            displayName: "John Doe",
            email: "john.doe@example.com"
        })
    });
    const data: any = await joinResponse.json();
    const sessionID: string = data.sessionID;

    const client: WebSocket = new WebSocket(`ws://localhost:3001/v1/connect/${sessionID}`);
    client.onopen = () => {
        client.close();
        done();
    };
    client.onerror = error => {
        expect(error).toBeNull()
        done();
    }
});

test("reply", async done => {
    const client = await openSocket("John Doe", "john.doe@example.com");
    const messageID = crypto.randomUUID();
    client.onopen = () => {
        client.send(JSON.stringify({
            payloadID: "https://sync.si/schemas/chat/clientChat",
            messageID: messageID,
            payload: {
                rawMessage: "Hello World!"
            }
        }));
    }

    client.onmessage = message => {
        expect(JSON.parse(message.data)).toMatchObject({
            replyTo: messageID,
            payloadID: "https://sync.si/schemas/chat/clientChatReply",
            payload: {
                status: "sent"
            }
        });
        client.close();
        done();
    };

    client.onerror = error => {
        expect(error).toBeNull();
        done();
    }
})