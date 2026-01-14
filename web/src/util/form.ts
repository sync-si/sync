export function emptyNull(value: string | null | undefined): string | null {
    if (value === undefined || value === null) {
        return null
    }
    if (value.trim() === '') {
        return null
    }
    return value
}
