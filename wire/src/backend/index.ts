import { Type } from 'typebox'
import Compile, { Validator } from 'typebox/compile'
import type { ServerMsgMap, SyncMsg } from '../types/msg.js'

const CHAT_TEXT_VALIDATOR = Type.String({
    minLength: 1,
    maxLength: 250,
})

const MEDIA_JWT_VALIDATOR = Type.String({
    minLength: 8,
})

const MESSAGE_VALIDATORS_UNCOMPILED = {
    ping: Type.Null(),

    message: Type.Union([
        Type.Object({
            text: CHAT_TEXT_VALIDATOR,
        }),
        Type.Object({
            text: Type.Optional(CHAT_TEXT_VALIDATOR),
            recommendation: MEDIA_JWT_VALIDATOR,
        }),
    ]),

    sync: Type.Union([
        Type.Object({
            state: Type.Literal('idle'),
        }),

        Type.Object({
            state: Type.Literal('paused'),
            media: MEDIA_JWT_VALIDATOR,
            position: Type.Number({ minimum: 0 }),
        }),

        Type.Object({
            state: Type.Literal('playing'),
            media: MEDIA_JWT_VALIDATOR,
            offset: Type.Number(/* i'm too dumb to figgure out what the range is here */),
            rate: Type.Number({ minimum: 0 }),
        }),
    ]),

    kick: Type.Object({
        userId: Type.String({ format: 'uuid' }),
    }),

    clearChat: Type.Null(),

    updateRoom: Type.Partial(
        Type.Object({
            name: Type.String({ minLength: 1, maxLength: 64 }),
        }),
    ),

    kickAll: Type.Null(),

    destroyRoom: Type.Null(),

    queryPlayback: Type.Object({
        userId: Type.String({ format: 'uuid' }),
    }),

    updatePlaylist: Type.Array(MEDIA_JWT_VALIDATOR),

    playbackStats: Type.Object({
        latency: Type.Number({ minimum: 0 }),
        offset: Type.Number(),
        buffer: Type.Number({ minimum: 0 }),
    }),

    struggle: Type.Null(),
} as const satisfies Record<string, Type.TSchema>

export const COMPILED_MESSAGE_VALIDATORS = Object.fromEntries(
    Object.entries(MESSAGE_VALIDATORS_UNCOMPILED).map(([key, schema]) => [key, Compile(schema)]),
) as {
    [K in keyof typeof MESSAGE_VALIDATORS_UNCOMPILED]: Validator<
        {},
        (typeof MESSAGE_VALIDATORS_UNCOMPILED)[K]
    >
}

const _validators = COMPILED_MESSAGE_VALIDATORS as Record<
    string,
    Validator<{}, Type.TSchema> | undefined
>

export type ClientMsgMap = {
    -readonly [K in keyof typeof MESSAGE_VALIDATORS_UNCOMPILED]: Type.Static<
        (typeof MESSAGE_VALIDATORS_UNCOMPILED)[K]
    >
}

export type ClientMessages = {
    -readonly [K in keyof ClientMsgMap]: SyncMsg<K, ClientMsgMap[K]>
}

export type ClientMessage = ClientMessages[keyof ClientMessages]

export function parseMessage(message: string): ClientMessage {
    let parsed: unknown

    try {
        parsed = JSON.parse(message)
    } catch {
        throw new Error('Invalid JSON')
    }

    if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Not a SyncMsg object')
    }

    if ('id' in parsed && typeof parsed.id !== 'number') {
        throw new Error('Invalid id type')
    }

    if ('replyTo' in parsed && typeof parsed.replyTo !== 'number') {
        throw new Error('Invalid replyTo type')
    }

    if (!('type' in parsed) || !('body' in parsed)) {
        throw new Error('Not a SyncMsg object')
    }

    if (typeof parsed.type !== 'string' || !(parsed.type in COMPILED_MESSAGE_VALIDATORS)) {
        throw new Error('Unknown message type')
    }

    const validator = _validators[parsed.type]

    if (!validator) {
        throw new Error('Invalid message type')
    }

    if (!validator.Check(parsed.body)) {
        throw new Error(
            'Invalid message body: ' +
                validator
                    .Errors(parsed.body)
                    .map((e) => e.message)
                    .join(', '),
        )
    }

    return parsed as ClientMessage
}

export function serializeMsg<Tkey extends keyof ServerMsgMap>(
    type: Tkey,
    body: ServerMsgMap[Tkey],
    id?: number,
    replyTo?: number,
): string {
    const obj: SyncMsg<string, unknown> = {
        type,
        body,
    }

    if (id !== undefined) {
        obj.id = id
    }

    if (replyTo !== undefined) {
        obj.replyTo = replyTo
    }

    return JSON.stringify(obj)
}

export * from '../close.js'
