import  {type User} from "./User.ts";
import type {Serializable} from "./Serializable.ts";

/**
 * A representation of a room. It contains websockets 
 */
export class Room implements Serializable {
    public readonly id: string;
    private readonly _users: Set<User> = new Set<User>();
    public _owner: User | undefined;

    constructor(id: string) {
        this.id = id;
    }

    serialize() {
        return {
            id: this.id,
            owner: this._owner?.serialize(),
            users: this._users.values().map((user: User) => user.serialize()).toArray()
        }
    }

    /**
     * Adds a user to this room and sets them as the owner if there isn't one
     * @param user The user
     */
    addUser(user: User) {
        this._users.add(user);
        if (!this._owner)
            this._owner = user
    }

    /**
     * Remove a user from this room and sets a new random owner or `undefined` if the room is empty
     * @param user The user
     */
    removeUser(user: User) {
        this._users.delete(user);
        if (this._owner === user) {
            this._owner = this._users.values().next().value
        }
    }

    /**
     * Sets the owner of this room
     * @param user The new owner
     */
    set owner(user: User) {
        if (!(this._users.has(<User>user)))
            throw new Error("Can't set owner to a user that isn't a member of this room!");
        this._owner = user;
    }

    /**
     * Get the owner of this room
     */
    get owner(): User | undefined {
        return this._owner;
    }

    /**
     * Get a shallow clone of the users in this room
     */
    get users(): Set<User> {
        return new Set(this._users);
    }

}