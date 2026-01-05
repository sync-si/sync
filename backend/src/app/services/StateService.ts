import {HANDLER_REGISTRY} from "../../WebSocketServer.ts";

export namespace StateService {
    export function start() {
        HANDLER_REGISTRY["https://sync.si/schemas/state/clientPlay"] = (ws, message) => {

        }

        HANDLER_REGISTRY["https://sync.si/schemas/state/clientRoom"] = (ws, message) => {

        }

        HANDLER_REGISTRY["https://sync.si/schemas/state/clientPlaylist"] = (ws, message) => {

        }
    }
}