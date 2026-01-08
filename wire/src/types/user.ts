export type WireUserState = 'present' | 'disconnected'

export interface WireUser {
    id: string
    name: string
    gravatarHash: string

    state: WireUserState
    lastStateChange: number
}
