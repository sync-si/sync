import { Room } from '../models'

/**
 * A manager for rooms
 */
export namespace RoomManager {
    const rooms: Map<string, Room> = new Map<string, Room>()

    /**
     * Create a new room
     * @param id
     */
    export function createRoom(id: string, name: string): Room {
        const newRoom = new Room(id, name)
        rooms.set(id, newRoom)

        console.log(`[RoomManager] Created room ${id}`)

        return newRoom
    }

    /**
     * Retrieves the room with the specified ID
     * @param id The ID
     * @returns The room if found, `undefined` otherwise
     */
    export function getRoom(id: string): Room | undefined {
        return rooms.get(id)
    }

    /**
     * Delete a room
     * @param id The room's ID
     * @returns true if room was successfully deleted, false otherwise
     */
    export function deleteRoom(id: string): boolean {
        console.log(`[RoomManager] Deleted ${id}`)
        return rooms.delete(id)
    }

    export function roomsIterator() {
        return rooms.values()
    }
}
