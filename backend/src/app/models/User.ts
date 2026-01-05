import * as Bun from "bun";
import type {Serializable} from "./Serializable.ts";
import type {WebSocketData} from "../../WebSocketServer.ts";

/**
 * Represents a user
 */
export class User implements Serializable{
    public readonly id: string;
    public readonly displayName: string;
    public readonly gravatarHash: string;
    public readonly socket: Bun.ServerWebSocket<WebSocketData>;

    constructor(id: string, displayName: string, gravatarHash: string, socket: Bun.ServerWebSocket<WebSocketData>) {
        this.id = id;
        this.displayName = displayName;
        this.gravatarHash = gravatarHash;
        this.socket = socket;
    }

    serialize() {
        return {
            id: this.id,
            displayName: this.displayName,
            gravatarHash: this.gravatarHash
        }
    }
}