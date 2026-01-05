import { Type, type Static } from "typebox";

const PlayStateSchema = Type.Object({
    payloadID: Type.Literal("https://sync.si/schemas/state/clientPlay"),
    payload: Type.Object({
        action: Type.Enum(["play", "pause"])
    })
});

const SeekStateSchema = Type.Object({
    payloadID: Type.Literal("https://sync.si/schemas/state/clientPlay"),
    payload: Type.Object({
        action: Type.Literal("seek"),
        position: Type.Number({minimum: 0})
    })
});

export const StateSchema = Type.Union([PlayStateSchema, SeekStateSchema]);

// Room
export const RoomStateSchema = Type.Object({
    payloadID: Type.Literal("https://sync.si/schemas/state/clientRoom"),
    payload: Type.Null()
});

// Playlist
export const PlaylistStateSchema = Type.Object({
    payloadID: Type.Literal("https://sync.si/schemas/state/clientPlaylist"),
    payload: Type.Null()
});

export type PlayState = Static<typeof PlayStateSchema>;
export type SeekState = Static<typeof SeekStateSchema>;
export type State = Static<typeof StateSchema>;
export type RoomState = Static<typeof RoomStateSchema>;
export type PlaylistState = Static<typeof PlaylistStateSchema>;