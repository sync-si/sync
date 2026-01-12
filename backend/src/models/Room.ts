import { ROOM_MAX_CHAT_HISTORY } from '../constants.ts'
import { MediaManager } from '../services/MediaManager.ts'
import { type User } from './User.ts'
import type { ChatMessage, SyncState, WireRoom } from '@sync/wire/types'

const SLUG_REGEX = /^[a-zA-Z0-9-_]{1,64}$/

/**
 * A representation of a room. It contains websockets
 */
export class Room {
    public static isValidSlug(slug: string): boolean {
        return SLUG_REGEX.test(slug)
    }

    public static checkName(name: string): string | undefined {
        name = name.trim()

        if (name.length === 0) {
            return 'Room name cannot be empty'
        }

        if (name.length > 64) {
            return 'Room name cannot be longer than 64 characters'
        }
    }

    public static check(slug: string, name: string): string | undefined {
        name = name.trim()

        if (!Room.isValidSlug(slug)) {
            return 'Invalid room slug'
        }

        const nameError = Room.checkName(name)
        if (nameError) return nameError
    }

    public readonly topic: string

    public readonly users = new Map<string, User>()

    public _owner: User | undefined

    public readonly chat: ChatMessage[] = []

    public playlist: string[] = []

    private sync: SyncState = { state: 'idle' }

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
        this.users.set(user.id, user)

        if (!this._owner) this._owner = user
    }

    /**
     * Remove a user from this room and sets a new random owner or `undefined` if the room is empty
     * @param user The user
     */
    public removeUser(user: User, newOwnerCallback: (ownerId?: string) => void) {
        this.users.delete(user.id)

        if (this._owner === user) {
            this.findNewOwner()
            if (this._owner) newOwnerCallback(this._owner.id)
        }
    }

    private findNewOwner() {
        if (this.users.size === 0) {
            this._owner = undefined
            return
        }

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
     * Promote a user to be the owner of this room
     */
    public promote(user: User): void {
        if (!this.users.has(user.id)) throw new Error('User is not in this room')
        this._owner = user
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

    /**
     * Stores a message in the room's history
     */
    public addMessage(msg: ChatMessage): void {
        this.chat.push(msg)

        if (this.chat.length > ROOM_MAX_CHAT_HISTORY) {
            this.chat.shift()
        }
    }

    public setSync(sync: SyncState): void {
        this.sync = sync
    }

    /**
     * Attempts to update the room's playlist, returns an error message on failure
     */
    public updatePlaylist(newPlaylist: string[]): string | undefined {
        const toValidate: string[] = []

        const pm = new Map<string, number>()

        for (const m of this.playlist) {
            pm.set(m, 0)
        }

        for (const m of newPlaylist) {
            const c = pm.get(m)

            if (c === undefined) {
                toValidate.push(m)
                pm.set(m, 1)
            } else if (c === 0) {
                pm.set(m, 1)
            } else {
                return 'Playlist contains duplicate media IDs'
            }
        }

        for (const m of toValidate) {
            if (!MediaManager.validateMedia(m)) {
                return `Media ID ${m} is invalid`
            }
        }

        // every media either:
        // - was already in the playlist
        // - is new and valid
        // - got removed

        this.playlist = newPlaylist
    }

    public toWire(): WireRoom {
        return {
            room: {
                name: this.name,
                slug: this.slug,
            },
            users: Array.from(this.users.values())
                .filter((x) => x.state !== 'new')
                .map((u) => u.toWire()),
            ownerId: this._owner?.id ?? '',

            chat: this.chat,
            playlist: this.playlist,
            sync: this.sync,
        }
    }
}
