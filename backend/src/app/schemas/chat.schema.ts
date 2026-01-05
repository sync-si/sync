import {Type, type Static} from 'typebox'

export const ClientChatSchema = Type.Object({
    payloadID: Type.Literal("https://sync.si/schemas/chat/clientChat"),
    payload: Type.Object({
        rawMessage: Type.String()
    })
});

export type ClientChat = Static<typeof ClientChatSchema>;