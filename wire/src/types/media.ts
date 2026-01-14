export type Media = string

export interface MediaBody {
    kind: 'videoFile'

    title: string
    source: string
    thumbnail?: string
    duration?: number
    size?: number
    mime?: string
}
