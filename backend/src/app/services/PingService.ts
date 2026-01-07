import { HANDLER_REGISTRY } from '../../WebSocketServer.ts'
import { PongDTO, toWSMessage } from '../dto'

export namespace PingService {
    export function start() {
        HANDLER_REGISTRY['https://sync.si/schemas/control/ping'] = (ws, message) => {
            ws.send(JSON.stringify(toWSMessage(new PongDTO(), message.messageID)))
        }
    }
}
