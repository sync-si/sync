import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'info' | 'success' | 'warning' | 'error'

export interface Toast {
    id: number
    message: string
    type: ToastType
    duration: number
}

const DEFAULT_DURATION = 4000

export const useToastStore = defineStore('toast', () => {
    const toasts = ref<Toast[]>([])
    let _toastId = 0

    function show(message: string, type: ToastType = 'info', duration: number = DEFAULT_DURATION) {
        const id = _toastId++
        const toast: Toast = { id, message, type, duration }
        toasts.value.push(toast)

        if (duration > 0) {
            setTimeout(() => {
                dismiss(id)
            }, duration)
        }

        return id
    }

    function dismiss(id: number) {
        const index = toasts.value.findIndex((t) => t.id === id)
        if (index !== -1) {
            toasts.value.splice(index, 1)
        }
    }

    function info(message: string, duration?: number) {
        return show(message, 'info', duration)
    }

    function success(message: string, duration?: number) {
        return show(message, 'success', duration)
    }

    function warning(message: string, duration?: number) {
        return show(message, 'warning', duration)
    }

    function error(message: string, duration?: number) {
        return show(message, 'error', duration)
    }

    function clear() {
        toasts.value = []
    }

    return {
        toasts,
        show,
        dismiss,
        info,
        success,
        warning,
        error,
        clear,
    }
})
