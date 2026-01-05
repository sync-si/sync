export const ICONS = ['arrow_forward', 'settings', 'share'] as const

export type TIconName = (typeof ICONS)[number]
