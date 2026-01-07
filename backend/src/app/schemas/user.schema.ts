import { Type } from 'typebox'
import { Compile, Validator } from 'typebox/compile'

const UserSchema = Type.Object({
    displayName: Type.String({
        minLength: 1,
        maxLength: 64,
    }),
    email: Type.String({
        format: 'email',
    }),
})

export const UserValidator: Validator = Compile(UserSchema)

export type UserSchemaType = Type.Static<typeof UserSchema>
