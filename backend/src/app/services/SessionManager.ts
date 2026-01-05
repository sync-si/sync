import {Room, Session, User} from "../models";

export namespace SessionManager {
    const sessions: Map<string, Session> = new Map();

    export function has(id: string) {
        return sessions.has(id);
    }

    export function get(id: string): Session | undefined {
        return sessions.get(id);
    }

    export function createSession(room: Room, user: User) {
        const session: Session = new Session(room, user);
        sessions.set(user.id, session);
        return session;
    }


}