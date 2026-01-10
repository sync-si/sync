import type { SyncMsg } from '@sync/wire'
import type { SyncWS } from '../server'
import { replyError } from './msg'

/**
 * Returns true, if the user is NOT the owner of the room. (it sent an error back to the user)
 * @param ws Message sender
 * @param msg Message we're guarding against
 */
export function ownerGuard(ws: SyncWS, msg: SyncMsg<string, unknown>): boolean {
    const me = ws.data.user

    if (me === me.room.owner) {
        return false
    }

    replyError(ws, msg, {
        type: 'unauthorized',
        message: 'You must be the owner of the room to perform this action.',
    })

    return true
}

/**
 * Returns true if the target user does IS the owner (sends an error back to the user)
 * @param ws Message sender
 * @param msg Message we're guarding against
 */
export function notOwnerGuard(ws: SyncWS, msg: SyncMsg<string, unknown>): boolean {
    const me = ws.data.user

    if (me !== me.room.owner) {
        return false
    }

    replyError(ws, msg, {
        type: 'unauthorized',
        message: "You can't perform this action as owner!",
    })
    return true
}

/**
 * Returns true if the target user does NOT exist in the room (sends an error back to the user)
 * @param ws Message sender
 * @param msg Message we're guarding against
 */
export function targetUserExistsGuard(
    ws: SyncWS,
    msg: SyncMsg<string, { userId: string }>,
): boolean {
    const me = ws.data.user
    if (me.room.users.has(msg.body.userId)) return false

    replyError(ws, msg, {
        type: 'userNotFound',
        message: 'The specified user does not exist in the room.',
    })

    return true
}

/**
 * Returns true if sender IS also the target user (sends an error back to the user)
 * @param ws Message sender
 * @param msg Message we're guarding against
 */
export function notSelfGuard(ws: SyncWS, msg: SyncMsg<string, { userId: string }>): boolean {
    const me = ws.data.user

    if (msg.body.userId !== me.id) return false

    replyError(ws, msg, {
        type: 'selfSuckIncident',
        message: "You can't perform this action on yourself!",
    })
    return true
}
