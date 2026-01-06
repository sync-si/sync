import type {Serializable} from "./Serializable.ts";
import type { WebSocketData } from '../../WebSocketServer.ts'
import type { Room } from './Room.ts'

/**
 * Represents a user
 */
export class User implements Serializable {
    public readonly id: string = crypto.randomUUID();
    public readonly displayName: string;
    public readonly gravatarHash: string;
    public room: Room | undefined;
    // Session data
    public readonly sessionID: string = crypto.randomUUID();
    public webSocket: Bun.ServerWebSocket<WebSocketData> | undefined;
    public state: "new" | "present" | "reconnecting" = "new";
    public inactiveSince: number | undefined;

    constructor(displayName: string, gravatarHash: string) {
        this.displayName = displayName;
        this.gravatarHash = gravatarHash;
    }

    serialize() {
        return {
            id: this.id,
            displayName: this.displayName,
            gravatarHash: this.gravatarHash
        }
    }
}