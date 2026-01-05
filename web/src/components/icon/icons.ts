export const ICONS = ['arrow_forward', 'settings', 'share', 'error'] as const

export type TIconName = (typeof ICONS)[number]
