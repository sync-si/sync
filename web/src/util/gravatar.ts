import SHA256 from 'crypto-js/sha256'

export function gravatarUrl(hash: string) {
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=48&r=x`
}

export function computeGravatarHash(email: string) {
    const normalizedEmail = email.trim().toLowerCase()
    return SHA256(normalizedEmail).toString()
}
