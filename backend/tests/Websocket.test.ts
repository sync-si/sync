import { beforeAll, describe, expect, test } from "bun:test";
import { startWebSocketServer } from "../src/WebSocketServer.ts";
import {RoomManager} from "../src/app/services";

beforeAll(() => {
    startWebSocketServer();
    RoomManager.createRoom("test-room")
});

describe("WebSocket", () => {

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
});