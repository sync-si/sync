import { serializeMsg } from '@sync/wire/backend'
import { REAPER_TIMEOUT_MS } from './constants'
import type { User } from './models'
import type { SyncServer } from './server'
import { RoomManager } from './services/RoomManager'
import { SessionManager } from './services/SessionManager'

// TODO: If this is a performance issue, we can probably track rooms that need to be checked
// (add to a set when created until first user joins or when a user leaves)

export function reap(server: SyncServer) {
    const roomsToDestroy = new Set<string>()
    const usersToRemove = new Set<User>()

    let userCount = 0
    let roomCount = 0

    for (const room of RoomManager.roomsIterator()) {
        usersToRemove.clear()

        for (const user of room.users.values()) {
            if (
                user.state !== 'present' &&
                Date.now() - user.lastStateChangeTimestamp > REAPER_TIMEOUT_MS
            ) {
                usersToRemove.add(user)
                SessionManager.destroy(user.sessionId)
            }
        }

        for (const user of usersToRemove) {
            userCount++

            room.removeUser(user, (ownerId) => {
                server.publish(room.topic, serializeMsg('roomUpdated', { ownerId }))
            })

            if (user.state !== 'new')
                server.publish(room.topic, serializeMsg('userLeft', { userId: user.id }))
        }

        if (room.isEmpty) {
            roomsToDestroy.add(room.slug)
        }
    }

    for (const roomSlug of roomsToDestroy) {
        roomCount++
        RoomManager.deleteRoom(roomSlug)
    }

    if (userCount || roomCount)
        console.log(`[Reaper] Removed ${userCount} users and ${roomCount} rooms`)
}
