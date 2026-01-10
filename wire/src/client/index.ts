import type { ClientMsgMap } from '../backend/index.js'
import type { SyncMsg } from '../types/index.js'

export function serializeMsg<Tkey extends keyof ClientMsgMap>(
    type: Tkey,
    body: ClientMsgMap[Tkey],
    id?: number,
    replyTo?: number,
): string {
    const obj: SyncMsg<string, unknown> = {
        type,
        body,
    }

    if (id !== undefined) {
        obj.id = id
    }

    if (replyTo !== undefined) {
        obj.replyTo = replyTo
    }

    return JSON.stringify(obj)
}

export * from '../close.js'
