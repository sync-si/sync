import {HANDLER_REGISTRY} from "../../WebSocketServer.ts";
import {ChatDTO, ClientChatReplyDTO, toWSMessage} from "../dto";

export namespace ChatService {
    export function start() {
        HANDLER_REGISTRY["https://sync.si/schemas/chat/clientChat"] = (ws, message) => {
            ws.publish(ws.data.roomChannel, JSON.stringify(toWSMessage(new ChatDTO(ws.data.clientID, message.payload.rawMessage))));
            ws.send(JSON.stringify(toWSMessage(new ClientChatReplyDTO("sent"), message.messageID)));
        }
    }
}