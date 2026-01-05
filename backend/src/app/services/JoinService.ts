import {HANDLER_REGISTRY} from "../../WebSocketServer.ts";
import {JoinDTO, toWSMessage, JoinReplyDTO} from "../dto";
import {createHash} from "crypto";
import {User} from "../models";

export namespace JoinService {
    function getGravatarHash(email: string): string {
        email = email.trim().toLowerCase();
        return createHash('sha256').update(email).digest('hex');
    }

    export const JOIN_PAYLOAD_ID = "https://sync.si/schemas/event/clientJoin";

    export function start() {
        HANDLER_REGISTRY[JOIN_PAYLOAD_ID] = (ws, message) => {
            const clientID = ws.data.clientID;
            const displayName = message.payload.displayName;
            const gravatarHash = getGravatarHash(message.payload.email);

            ws.data.user = new User(clientID, displayName, gravatarHash);
            ws.data.room.addUser(ws.data.user);

            ws.send(JSON.stringify(toWSMessage(
                new JoinReplyDTO(clientID, displayName, gravatarHash),
                message.messageID
            )));

            ws.publish(ws.data.roomSlug, JSON.stringify(toWSMessage(
                new JoinDTO(clientID, displayName, gravatarHash)
            )));
        }
    }
}