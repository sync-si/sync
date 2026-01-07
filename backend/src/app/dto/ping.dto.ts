import type { IPayload } from './index.ts'

export class PongDTO implements IPayload {
    payloadID: string = 'https://sync.si/schemas/control/pong'
    systemTime: number = Date.now()

    constructor() {}
}
