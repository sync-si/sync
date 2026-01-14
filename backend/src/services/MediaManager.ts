import type { MediaBody } from '@sync/wire'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

export namespace MediaManager {
    type Named = {
        name?: string
    }

    const TIMEOUT_MS = 5555

    const DEFAULT_SECRET = 'sync3-media-dev-secret'
    const secret = getSecret()

    function getSecret(): Uint8Array {
        const secret = process.env.MEDIA_SECRET

        if (!secret) {
            console.warn('WARNING: MEDIA_SECRET not set, using insecure default!')
            return new TextEncoder().encode(DEFAULT_SECRET)
        }

        return new TextEncoder().encode(secret)
    }

    function validateUrlAndExtractTitle(maybeUrl: string): string | undefined {
        let url: URL
        try {
            url = new URL(maybeUrl)
        } catch {
            throw new MediaValidationError('invalidURL', 'The media source is not a valid URL.')
        }

        if (url.protocol !== 'https:')
            throw new MediaValidationError('invalidScheme', 'Only HTTPS URLs are supported.')

        const segment = url.pathname.split('/').at(-1)

        if (!segment || segment.length === 0) return undefined

        return decodeURIComponent(segment)
    }

    function isVideoContainer(contentType: string | undefined): contentType is string {
        if (!contentType) return false
        if (contentType.startsWith('video/mp4')) return true
        if (contentType.startsWith('video/webm')) return true
        return false
    }

    async function fetchHeadWithTimeout(url: string, timeoutMs: number = TIMEOUT_MS) {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), timeoutMs)

        let response: Response

        try {
            response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
            })
        } catch (e: unknown) {
            if ((e as Named).name === 'AbortError') {
                throw new MediaValidationError('timeout', 'The request to fetch media timed out.')
            }
            throw new MediaValidationError('badResponse', 'Failed to fetch media source.')
        }
        clearTimeout(timeout)

        if (!response.ok) {
            throw new MediaValidationError(
                'badResponse',
                `Fetching media source returned bad response: ${response.status}`,
            )
        }

        return response.headers
    }

    function parseSize(sizeStr: string | null | undefined): number | undefined {
        if (!sizeStr) return undefined
        const n = Number.parseInt(sizeStr, 10)
        if (Number.isNaN(n)) return undefined

        return n
    }

    export async function getMediaJwt(source: string): Promise<string> {
        const title = validateUrlAndExtractTitle(source)

        const headers = await fetchHeadWithTimeout(source)

        const contentType = headers.get('Content-Type') || undefined

        if (!isVideoContainer(contentType))
            throw new MediaValidationError(
                'unsupportedMime',
                `Unsupported media MIME type: ${contentType || 'unknown'}`,
            )

        const payload: MediaBody = {
            kind: 'videoFile',

            source,
            title: title || 'Video',

            size: parseSize(headers.get('Content-Length')),
            mime: contentType,
        }

        return await new SignJWT(payload as unknown as JWTPayload)
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret)
    }

    export async function checkMediaJwt(jwt: string): Promise<boolean> {
        try {
            await jwtVerify(jwt, secret, { algorithms: ['HS256'] })
            return true
        } catch {
            return false
        }
    }
}

export type MediaValidationErrorType =
    | 'invalidURL'
    | 'invalidScheme'
    | 'timeout'
    | 'badResponse'
    | 'unsupportedMime'

export class MediaValidationError extends Error {
    constructor(
        public type: MediaValidationErrorType,
        message: string,
    ) {
        super(message)
    }
}
