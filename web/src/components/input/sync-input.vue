<script setup lang="ts">
import SyncIcon from '../icon/sync-icon.vue'

const props = defineProps<{
    name: string
    label: string
    placeholder?: string
    err?: string

    required?: boolean
    disabled?: boolean
    autocomplete?: string
}>()

const model = defineModel<string>({ default: '' })
</script>

<template>
    <div class="s-input" :class="{ 'has-error': err, disabled }">
        <input
            class="s-input-input"
            v-model="model"
            type="input"
            :class="{ 'input-field-error': err }"
            :name="props.name"
            :id="props.name"
            :disabled="props.disabled ?? false"
            :placeholder="props.placeholder ?? ' '"
            :required="props.required"
            :autocomplete="props.autocomplete"
        />

        <label :for="props.name" class="s-input-label">{{ label }}</label>

        <div v-if="err" class="s-input-error">
            <SyncIcon icon="error" :size="24" class="error-icon" />

            <!-- TODO: Use proper tooltip system -->
            <div class="error-tooltip">
                {{ err }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.s-input {
    font-size: 16px;
    font-family: var(--s-font);

    position: relative;
    min-width: 150px;
    background-color: var(--s-background-alt);
    border-bottom: 3px solid var(--s-background-alt);
    border-radius: 3px;
    display: flex;
    align-items: center;
    transition: border-color 0.2s;

    &:focus-within {
        border-color: var(--s-primary);
    }
}

.s-input.disabled {
    opacity: 0.8;
    pointer-events: none;
}

.has-error {
    background-color: var(--s-error-light);
    border-color: var(--s-error-light);

    &:focus-within {
        border-color: var(--s-error-dark);
    }
}

.has-error .s-input-label {
    color: var(--s-error);
}

.s-input-input {
    width: 100%;
    border: 0;
    background: transparent;
    outline: 0;
    font-size: 1rem;
    color: var(--s-text);
    font-weight: var(--s-weight-medium);
    padding: 16px 4px 16px 12px;

    &::placeholder {
        color: transparent;
        transition: color 0.2s cubic-bezier(0.33, 1, 0.68, 1);
    }

    &:focus {
        ~ .s-input-label {
            color: var(--s-primary);
        }

        &::placeholder {
            transition: color 0.2s cubic-bezier(0.32, 0, 0.67, 0);
            color: var(--s-text-subtler);
        }
    }

    &:not(:placeholder-shown),
    &:focus {
        transform: translateY(0.5rem);

        ~ .s-input-label {
            transform: translateY(-1rem);
            font-size: 0.75rem;
            font-weight: var(--s-weight-bold);
        }
    }
}

.s-input.has-error .s-input-input {
    &:focus {
        ~ .s-input-label {
            color: var(--s-error-dark);
        }
    }
}

.s-input-label {
    font-weight: var(--s-weight-medium);
    position: absolute;
    display: block;
    font-size: 1rem;
    color: var(--s-text-subtle);
    padding-left: 12px;
    margin-top: 3px;
    transform-origin: 0 0;
    transition: 0.2s;
}

.s-input-error {
    position: absolute;
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
}

.error-icon {
    fill: var(--s-error);
    cursor: pointer;
}

.error-tooltip {
    position: absolute;
    left: 22px;
    top: 50%;
    transform: translateY(-50%);
    background: var(--s-error);
    color: var(--s-text-on-color);
    padding: 6px 10px;
    border-radius: 4px;
    font-size: 1rem;
    white-space: nowrap;

    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s;
}

/* Show on hover */
.s-input-error:hover .error-tooltip {
    opacity: 1;
    visibility: visible;
}
</style>
