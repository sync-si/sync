type ErrorType =
    | 'binaryData'
    | 'malformedMsg'
    | 'nobodyCared'
    | 'serverError'
    | 'unauthorized'
    | 'ratelimit'
    | 'userNotFound'
    | 'selfSuckIncident'
    | 'invalidChatMessage'
    | 'invalidMedia'
    | 'badSync'
    | 'badPlaylist'
    | 'badRoomUpdate'
export interface SyncError {
    cause?: string // message type that caused the error (helping clients out)

    type: ErrorType

    message: string // A human-readable error message

    timeoutSeconds?: number // for 'ratelimit' errors
}
