export namespace MediaManager {
    export async function verifyMedia(source: string): Promise<string> {
        // TODO: Implement media verification logic
        return source
    }

    export function validateMedia(_jws: string): boolean {
        // TODO: Implement media validation logic
        return true
    }
}

export type MediaValidationErrorType =
    | 'invalidSourceFormat'
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
