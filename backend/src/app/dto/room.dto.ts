import type { ClientID } from './client.dto.ts'
import type { IPayload } from './index.ts'

const SHA256_REGEX = /^[a-f0-9]{64}$/i

export class JoinDTO implements IPayload {
    payloadID: string = 'https://sync.si/schemas/event/join'
    clientID: ClientID
    displayName: string
    gravatarHash: string

    constructor(clientID: ClientID, displayName: string, gravatarHash: string) {
        this.clientID = clientID
        this.displayName = displayName
        this.gravatarHash = gravatarHash
        if (!SHA256_REGEX.test(gravatarHash)) {
            throw new Error('Invalid gravatar hash', { cause: gravatarHash })
        }
    }
}

export class JoinReplyDTO extends JoinDTO {
    override payloadID: string = 'https://sync.si/schemas/event/joinReply'
}

export class LeaveDTO implements IPayload {
    payloadID: string = 'https://sync.si/schemas/event/leave'
    clientID: ClientID
    reason: 'disconnect' | 'kick' | 'time_out'

    constructor(clientID: ClientID, reason: 'disconnect' | 'kick' | 'time_out') {
        this.clientID = clientID
        this.reason = reason
    }
}
