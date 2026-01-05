import { Type, type Static } from 'typebox';

export const JoinSchema = Type.Object({
    payloadID: Type.Literal("https://sync.si/schemas/event/clientJoin"),
    messageID: Type.String({ maxLength: 64 }),
    payload: Type.Object({
        displayName: Type.String({
            minLength: 1,
            maxLength: 64
        }),
        email: Type.String({
            format: "email"
        })
    })
});

export type Join = Static<typeof JoinSchema>;