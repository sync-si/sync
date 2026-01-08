type ErrorType =
    | 'nobodyCared'
    | 'malformedMsg'
    | 'unauthorized'
    | 'ratelimit'
    | 'invalidMedia'
    | 'badSync'
    | 'userNotFound'
    | 'badRoomUpdate'
    | 'playlistCurrentMediaMissing'
    | 'playlistDuplicates'

export interface SyncError {
    cause?: string // message type that caused the error (helping clients out)

    type: ErrorType

    message: string // A human-readable error message

    timeoutSeconds?: number // for 'ratelimit' errors
}
