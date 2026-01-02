<script setup lang="ts">
const props = defineProps<{
    text: string
    roundness: 'min' | 'pill'
    color: 'primary' | 'primary-lt' | 'danger' | 'danger-lt' | 'background'
    disabled?: boolean
}>()

const emit = defineEmits<{
    (e: 'click'): void
}>()
</script>

<template>
    <button
        :disabled="props.disabled ?? false"
        @click="emit('click')"
        :class="['s-btn', `s-btn-r${props.roundness}`, `s-btn-c${props.color}`]"
    >
        {{ props.text }}
    </button>
</template>

<style scoped>
.s-btn {
    /* Reset */
    border: none;
    margin: 0;
    width: auto;
    line-height: normal;
    appearance: none;
    -webkit-appearance: none;

    /* Custom defaults */
    overflow: hidden;
    box-sizing: border-box;

    /* Common apperance */
    font-family: var(--s-font);
    font-weight: var(--s-weight-bold);

    font-size: 18px;
    padding: 14px;

    cursor: pointer;
    transition:
        background-color 0.2s ease-in-out,
        color 0.2s ease-in-out,
        border-color 0.2s ease-in-out;
}

.s-btn:focus-visible {
    outline: 2px solid var(--s-primary);
    outline-offset: 2px;
}

.s-btn-rmin {
    border-radius: 4px;
}

.s-btn-rpill {
    border-radius: 9999px;
    padding: 10px 20px;
}

.s-btn-cprimary {
    background-color: var(--s-primary);
    color: var(--s-text-on-color);

    &:hover {
        background-color: var(--s-primary-dark);
    }
}

.s-btn-cprimary-lt {
    background-color: transparent;
    color: var(--s-primary);

    &:hover {
        background-color: var(--s-primary-light);
    }
}

.s-btn-cdanger {
    background-color: var(--s-error);
    color: var(--s-text-on-color);

    &:hover {
        background-color: var(--s-error-dark);
    }
}

.s-btn-cdanger-lt {
    background-color: transparent;
    color: var(--s-error);

    &:hover {
        background-color: var(--s-error-light);
    }
}

.s-btn-cbackground {
    background-color: var(--s-background);
    color: var(--s-text-subtle);
    border: 2px solid var(--s-border);

    &:hover {
        background-color: var(--s-background-alt);
    }
}

.s-btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}
</style>
