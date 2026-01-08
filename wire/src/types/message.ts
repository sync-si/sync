import type { Media } from './media.js'

export interface UserMessage {
    type: 'user'
    timestamp: number
    userId: string
    text?: string
    recommendation?: Media
}

export interface SystemMessage {
    type: 'system'
    timestamp: number
    text: string
}

export type ChatMessage = UserMessage | SystemMessage
