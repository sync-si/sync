import type { MediaBody } from '@sync/wire'

export type MediaJWT = MediaBody & { token: string }

export function parseMediaJwt(token: string): MediaJWT {
    const body = atob(token.split('.')[1]!)
    const media: MediaBody = JSON.parse(body)

    return { ...media, token }
}

export function isValidUrl(str: string): boolean {
    try {
        new URL(str)
        return true
    } catch {
        return false
    }
}
