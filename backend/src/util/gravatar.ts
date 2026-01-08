import { createHash } from 'node:crypto'

export function getGravatarHash(email: string): string {
    email = email.trim().toLowerCase()
    return createHash('sha256').update(email).digest('hex')
}

const SHA256_REGEX = /^[a-f0-9]{64}$/i

export function isGravatarHash(hash: string): boolean {
    return SHA256_REGEX.test(hash)
}
