type ErrorType =
    | 'binaryData'
    | 'malformedMsg'
    | 'nobodyCared'
    | 'serverError'
    | 'unauthorized'
    | 'ratelimit'
    | 'badSync'
    | 'invalidMedia'
    | 'userNotFound'
    | 'badRoomUpdate'
    | 'playlistDuplicates'
    | 'playlistCurrentMediaMissing'

export interface SyncError {
    cause?: string // message type that caused the error (helping clients out)

    type: ErrorType

    message: string // A human-readable error message

    timeoutSeconds?: number // for 'ratelimit' errors
}
