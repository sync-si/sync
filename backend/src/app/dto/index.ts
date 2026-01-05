export interface IPayload {
    payloadID: string;
}

/**
 * Interface representing a WebSocket message
 */
export interface IWSMessage {
    messageID: string;
    replyTo?: string;
    payloadID: string;
    payload: object;
}

/**
 * Convert a payload object to a WebSocket message that conforms to the specification
 * @param payload Payload to carry
 * @param replyID The ID of the message to reply to
 */
export function toWSMessage(payload: IPayload, replyID?: string): IWSMessage {
    const { payloadID, ...payloadFields } = payload;
    return {
        messageID: crypto.randomUUID(),
        payloadID: payloadID,
        replyTo: replyID,
        payload: payloadFields,
    }
}

export * from "./chat.dto.ts";
export * from "./client.dto.ts";
export * from "./ping.dto.ts";
export * from "./room.dto.ts";
export * from "./state.dto.ts";