import { Type } from 'typebox'
import { Compile } from 'typebox/compile'

const UserSchema = Type.Object({
    displayName: Type.String({
        minLength: 1,
        maxLength: 64,
    }),
    gravatarHash: Type.Optional(
        Type.String({
            maxLength: 64,
        }),
    ),
})

export const UserValidator = Compile(UserSchema)

export type UserSchemaType = Type.Static<typeof UserSchema>
