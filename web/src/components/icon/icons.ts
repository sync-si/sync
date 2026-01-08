export const ICONS = [
    'arrow_forward',
    'settings',
    'share',
    'error',
    'sync',
    'delete',
    'add',
    'arrow_down',
    'promote',
    'remove',
] as const

export type TIconName = (typeof ICONS)[number]
