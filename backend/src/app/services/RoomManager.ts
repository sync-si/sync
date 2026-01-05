import { Room } from "../models/Room"

/**
 * A manager for rooms
 */
export namespace RoomManager {
    const rooms: Map<string, Room> = new Map<string, Room>();

    /**
     * Returns a shallow clone of all rooms
     */
    export function allRooms(): Map<string, Room> {
        return new Map<string, Room>(rooms)
    }

    /**
     * Create a new room
     * @param id
     */
    export function createRoom(id: string): Room {
        const newRoom = new Room(id);
        rooms.set(id, newRoom);
        return newRoom;
    }

    /**
     * Retrieves the room with the specified ID
     * @param id The ID
     * @returns The room if found, `undefined` otherwise
     */
    export function getRoom(id: string): Room | undefined {
        return rooms.get(id);
    }

    /**
     * Delete a room
     * @param id The room's ID
     * @returns true if room was successfully deleted, false otherwise
     */
    export function deleteRoom(id: string): boolean {
        getRoom(id)?.users.values().forEach((user) => {
            user.socket.close(4000, "Room deleted.");
        })
        return rooms.delete(id);
    }
}