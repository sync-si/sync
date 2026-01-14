<script setup lang="ts">
import { useToastStore, type Toast } from '../../stores/toast'

const props = defineProps<{
    toast: Toast
}>()

const toastStore = useToastStore()

function getTypeClass(type: Toast['type']) {
    return `toast-${type}`
}
</script>

<template>
    <div :class="['sync-toast', getTypeClass(props.toast.type)]">
        <span class="toast-message">{{ props.toast.message }}</span>
        <button class="toast-dismiss" @click="toastStore.dismiss(props.toast.id)">
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    </div>
</template>

<style scoped>
.sync-toast {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-family: var(--s-font);
    font-size: 14px;
    font-weight: var(--s-weight-medium);
    min-width: 280px;
    max-width: 400px;
}

.toast-message {
    flex: 1;
    line-height: 1.4;
}

.toast-dismiss {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: opacity 0.2s;
    color: inherit;
}

.toast-dismiss:hover {
    opacity: 1;
}

/* Type variants */
.toast-info {
    background-color: var(--s-text);
    color: var(--s-text-on-color);
}

.toast-success {
    background-color: var(--s-success);
    color: var(--s-text-on-color);
}

.toast-warning {
    background-color: var(--s-gold);
    color: var(--s-warning-dark);
}

.toast-error {
    background-color: var(--s-error);
    color: var(--s-text-on-color);
}
</style>
