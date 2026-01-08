import type { Room } from './Room.ts'
import { getGravatarHash, isGravatarHash } from '../util/gravatar.ts'
import type { WireUser } from '@sync/wire'
import type { SyncWS } from '../server.ts'

export type TUserState = 'new' | 'present' | 'reconnecting'

/**
 * Represents a user
 */
export class User {
    public static check(name: string, gravatarHash?: string): string | undefined {
        name = name.trim()

        if (name.length === 0) {
            return 'Display name cannot be empty'
        }

        if (name.length > 64) {
            return 'Display name cannot be longer than 64 characters'
        }

        if (gravatarHash && !isGravatarHash(gravatarHash)) {
            return 'Invalid gravatar hash'
        }
    }

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
    public webSocket: SyncWS | undefined = undefined

    /**
     * Current state of the user
     */
    public state: TUserState = 'new'

    /**
     * Timestamp of user's last state change (e.g., became inactive, reconnected).
     */
    public lastStateChangeTimestamp: number = Date.now()

    /**
     * User's gravatar hash
     */
    public readonly gravatarHash: string

    constructor(
        /**
         * User's room. Will join when created
         */
        public readonly room: Room,

        /**
         * User's display name
         */
        public readonly displayName: string,

        gravatarHash?: string,
    ) {
        this.gravatarHash = gravatarHash ?? getGravatarHash(this.displayName)

        // Join!
        this.room.addUser(this)
    }

    public toWire(): WireUser {
        return {
            id: this.id,
            name: this.displayName,
            gravatarHash: this.gravatarHash,
            state: this.state === 'present' ? 'present' : 'disconnected',
            lastStateChange: this.lastStateChangeTimestamp,
        }
    }
}
