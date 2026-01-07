import { createHash } from 'node:crypto'

export function getGravatarHash(email: string): string {
    email = email.trim().toLowerCase()
    return createHash('sha256').update(email).digest('hex')
}
