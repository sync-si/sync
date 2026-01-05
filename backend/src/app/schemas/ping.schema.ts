import { Type, type Static } from "typebox";

export const PingSchema = Type.Object({
    payloadID: Type.Literal("https://sync.si/schemas/control/ping"),
    payload: Type.Null()
});

export type Ping = Static<typeof PingSchema>;