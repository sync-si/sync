<script setup lang="ts">
import type { TIconName } from '../icon/icons'

const props = defineProps<{
    text?: string
    icon?: TIconName
    bstyle: 'mat' | 'pill' | 'small' | 'circle' | 'none'
    color: 'primary' | 'primary-lt' | 'danger' | 'danger-lt' | 'background' | 'bgnb' | 'white'
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
}>()

const emit = defineEmits<{
    (e: 'click'): void
}>()
</script>

<template>
    <button
        @click="emit('click')"
        :disabled="props.disabled ?? false"
        :class="['s-btn', `s-btn-s${props.bstyle}`, `s-btn-c${props.color}`]"
        :type="props.type ?? 'button'"
    >
        <div class="s-btn-content">
            <svg width="24" height="24" v-if="props.icon" class="s-btn-icon">
                <use :href="`/__spritemap#sprite-${props.icon}`" />
            </svg>

            <span v-if="props.text">
                {{ props.text }}
            </span>
        </div>
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

    /* Layout */
    display: inline-flex;
    justify-content: center;

    .s-btn-content {
        min-height: 24px;
        display: inline-flex;
        align-items: center;
        gap: 8px;

        span {
            line-height: 24px;
        }
    }

    /* Common apperance */
    font-family: var(--s-font);
    font-weight: var(--s-weight-bold);

    cursor: pointer;
    transition:
        background-color 0.2s ease-in-out,
        color 0.2s ease-in-out,
        border-color 0.2s ease-in-out;
}

.s-btn-smat {
    font-size: 18px;
    padding: 13px;
    border-radius: 4px;
}

.s-btn-spill {
    font-size: 18px;
    padding: 10px 20px;
    border-radius: 9999px;
}

.s-btn-ssmall {
    font-size: 16px;
    padding: 8px 8px;
    border-radius: 8px;
}

.s-btn-scircle {
    padding: 12px;
    border-radius: 24px;
}

.s-btn-snone {
    padding: 0;
    border-radius: 0;
}

.s-btn:focus-visible {
    outline: 2px solid var(--s-primary);
    outline-offset: 2px;
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

.s-btn-cbgnb {
    background-color: transparent;
    color: var(--s-text-subtle);

    &:hover {
        color: var(--s-primary-dark);
    }
}

.s-btn-cwhite {
    background-color: transparent;
    color: #fffc;

    &:hover {
        color: white;
    }
}

.s-btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.s-btn-icon {
    fill: currentColor;
}
</style>
