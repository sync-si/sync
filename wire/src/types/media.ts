export type Media = string

export interface MediaBody {
    iat: number

    kind: 'videoFile'

    title: string
    source: string
    thumbnail?: string
    duration?: number
}
