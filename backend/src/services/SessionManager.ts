import { User } from '../models'

export namespace SessionManager {
    const sessions: Map<string, User> = new Map()

    export function has(id: string) {
        return sessions.has(id)
    }

    export function get(id: string) {
        return sessions.get(id)
    }

    export function register(user: User) {
        sessions.set(user.sessionId, user)

        console.log(`[SessionManager] Created user ${user.id}`)
    }
}
