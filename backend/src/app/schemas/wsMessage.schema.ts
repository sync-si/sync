import { Type, type Static } from 'typebox';

export const WSMessageMetaSchema = Type.Object({
    messageID: Type.String({ maxLength: 64 }),
});

export type WSMessageMeta = Static<typeof WSMessageMetaSchema>;