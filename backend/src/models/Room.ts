import { type User } from './User.ts'
import type { WireRoom } from '@sync/wire/types'

const SLUG_REGEX = /^[a-zA-Z0-9-_]{3,64}$/

/**
 * A representation of a room. It contains websockets
 */
export class Room {
    public static isValidSlug(slug: string): boolean {
        return SLUG_REGEX.test(slug)
    }

    public static check(slug: string, name: string): string | undefined {
        name = name.trim()

        if (!Room.isValidSlug(slug)) {
            return 'Invalid room slug'
        }

        if (name.length === 0) {
            return 'Room name cannot be empty'
        }

        if (name.length > 64) {
            return 'Room name cannot be longer than 64 characters'
        }
    }

    public readonly topic: string

    public readonly users = new Set<User>()
    public _owner: User | undefined

    public constructor(
        public readonly slug: string,
        public name: string,
    ) {
        this.topic = `room:${slug}`
    }

    /**
     * Adds a user to this room and sets them as the owner if there isn't one
     *
     * Don't call this as the user will call this for himself
     * @param user The user
     */
    public addUser(user: User) {
        this.users.add(user)

        if (!this._owner) this._owner = user
    }

    /**
     * Remove a user from this room and sets a new random owner or `undefined` if the room is empty
     * @param user The user
     */
    public removeUser(user: User) {
        this.users.delete(user)

        if (this._owner === user) {
            this.assignNewOwner()
        }
    }

    private assignNewOwner() {
        const candidates = Array.from(this.users.values())

        candidates.sort((a, b) => {
            const ap = a.state === 'present'
            const bp = b.state === 'present'

            // always prefer present users
            if (ap && !bp) return -1
            if (!ap && bp) return 1

            if (!(ap && bp)) return 0 // don't care about inactive/reconnecting order

            // both are present, prefer the one who has been present the longest
            return a.lastStateChangeTimestamp - b.lastStateChangeTimestamp
        })

        this._owner = candidates[0]
    }

    /**
     * Get the owner of this room
     */
    get owner(): User | undefined {
        return this._owner
    }

    public get isEmpty(): boolean {
        return this.users.size === 0
    }

    public toWire(): WireRoom {
        return {
            room: {
                name: this.name,
                slug: this.slug,
            },
            users: Array.from(this.users.values()).map((u) => u.toWire()),
            ownerId: this._owner?.id ?? '',

            // TODO: impl
            chat: [],
            playlist: [],
            sync: { state: 'idle' },
        }
    }
}
