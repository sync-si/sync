import type { Serializable } from './Serializable.ts'
import type { WebSocketData } from '../../WebSocketServer.ts'
import type { Room } from './Room.ts'
import { getGravatarHash } from '../util/gravatar.ts'

export type TUserState = 'new' | 'present' | 'reconnecting'

/**
 * Represents a user
 */
export class User implements Serializable {
    /**
     * Unique ID of the user
     */
    public readonly id: string = crypto.randomUUID()

    /**
     * Session's secret key, used for authentication of WS connections
     */
    public readonly sessionId: string = crypto.randomUUID()

    /**
     * The WebSocket connection of this user
     */
    public webSocket: Bun.ServerWebSocket<WebSocketData> | undefined

    /**
     * Current state of the user
     */
    public state: TUserState = 'new'

    /**
     * Timestamp of user's last state change (e.g., became inactive, reconnected).
     */
    public lastStateChangeTimestamp: number = Date.now()

    constructor(
        /**
         * User's room. Will join when created
         */
        public readonly room: Room,

        /**
         * User's display name
         */
        public readonly displayName: string,

        /**
         * User's gravatar hash
         */
        public readonly gravatarHash?: string,
    ) {
        if (!this.gravatarHash) {
            this.gravatarHash = getGravatarHash(this.displayName)
        }

        // Join!
        this.room.addUser(this)
    }

    serialize() {
        return {
            id: this.id,
            displayName: this.displayName,
            gravatarHash: this.gravatarHash,
        }
    }
}
