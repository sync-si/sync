import type {Serializable} from "./Serializable.ts";

/**
 * Represents a user
 */
export class User implements Serializable {
    public readonly id: string = crypto.randomUUID();
    public readonly displayName: string;
    public readonly gravatarHash: string;

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