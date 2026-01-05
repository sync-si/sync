import  {type User} from "./User.ts";
import  {type Room} from "./Room.ts";
import type {Serializable} from "./Serializable.ts";

/**
 * Represents a client session.
 */
export class Session implements Serializable {

    public readonly id: string = crypto.randomUUID();
    public readonly room: Room;
    public readonly user: User;
    public state: "new" | "present" | "reconnecting" = "new";
    public inactiveSince: number | undefined;

    constructor(room: Room, user: User) {
        this.room = room;
        this.user = user;
    }

    serialize() {
        return {
            sessionID: this.id,
            roomID: this.room.id,
            userID: this.user.id,
            state: this.state,
            inactiveSince: this.inactiveSince,
        }
    }
}