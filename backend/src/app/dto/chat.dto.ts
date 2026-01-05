import type {ClientID} from "./client.dto.ts";
import type {IPayload} from "./index.ts";

export class ClientChatReplyDTO implements IPayload {
    payloadID = "https://sync.si/schemas/chat/clientChatReply";
    status: 'sent' | 'error';
    errorMessage?: string;

    constructor(status: "sent" | "error", errorMessage?: string) {
        this.status = status;
        if (errorMessage) {
            this.errorMessage = errorMessage;
        }
    }
}

export class ChatDTO implements IPayload {
    payloadID = "https://sync.si/schemas/chat/chat";
    clientID: ClientID;
    message: string;

    constructor(clientID: ClientID, message: string) {
        this.clientID = clientID;
        this.message = message;
    }
}