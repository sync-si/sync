import type {ClientID} from "./client.dto.ts";
import type {IPayload} from "./index.ts";

export class PlayStateDTO implements IPayload {
    payloadID: string = "https://sync.si/schemas/state/play";
    action: 'play' | 'pause' | 'seek';
    position?: number;

    constructor(action: "play" | "pause" | "seek", position?: number) {
        this.action = action;
        if (action == 'seek' && !position) {
            throw new Error("The 'seek' action requires a position value!");
        }
        if (position) {
            if (position < 0)
                throw new Error("Position cannot be negative!", {cause: position});
            this.position = position;
        }
    }
}

export class RoomStateDTO implements IPayload {
    payloadID: string = "https://sync.si/schemas/state/room";
    clientID: ClientID;

    constructor(clientID: ClientID) {
        this.clientID = clientID;
    }
}

export class PlaylistDTO implements IPayload {
    payloadID: string = "https://sync.si/schemas/state/playlist";
    clientID: ClientID;

    constructor(clientID: ClientID) {
        this.clientID = clientID;
    }
}

export class ErrorDTO implements IPayload {
    payloadID: string = "https://sync.si/schemas/error";
    errorCode: number;
    errorMessage: string;

    constructor(errorCode: number, errorMessage: string) {
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }
}