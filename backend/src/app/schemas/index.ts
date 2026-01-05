import { Type } from "typebox";
import { WSMessageMetaSchema } from "./wsMessage.schema.ts";
import { ClientChatSchema } from "./chat.schema.ts";
import {PingSchema} from "./ping.schema.ts";
import { StateSchema, RoomStateSchema, PlaylistStateSchema } from "./state.schema.ts";
import { Compile, Validator } from "typebox/compile";
import {JoinSchema} from "./roomEvent.schema.ts";

function toWSMessagePayloadSchema<T extends Type.TSchema>(schema: T) {
    return Type.Intersect([
        WSMessageMetaSchema,
        schema
    ]);
}

const WSMessageSchema = Type.Union([
    toWSMessagePayloadSchema(JoinSchema),
    toWSMessagePayloadSchema(ClientChatSchema),
    toWSMessagePayloadSchema(PingSchema),
    toWSMessagePayloadSchema(StateSchema),
    toWSMessagePayloadSchema(RoomStateSchema),
    toWSMessagePayloadSchema(PlaylistStateSchema)
]);

export const WSMessageValidator: Validator = Compile(WSMessageSchema);