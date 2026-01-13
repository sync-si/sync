<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import SyncIcon from '../icon/sync-icon.vue'
import { offset, useFloating } from '@floating-ui/vue'

const props = defineProps<{
    name: string
    label: string
    placeholder?: string
    err?: string

    required?: boolean
    disabled?: boolean
    autocomplete?: string

    alwaysFloatLabel?: boolean
}>()

const model = defineModel<string>({ default: '' })

const errorRef = useTemplateRef('err')
const errPopup = useTemplateRef('err-popup')
const { floatingStyles } = useFloating(errorRef, errPopup, {
    placement: 'right',
    middleware: [offset(8)],
})

const showPopover = ref(false)

function setPopover(value: boolean) {
    showPopover.value = value
}
</script>

<template>
    <div
        class="s-input"
        :class="{ 'has-error': err, 'always-float-label': alwaysFloatLabel, disabled }"
    >
        <input
            class="s-input-input"
            v-model="model"
            type="text"
            :class="{ 'input-field-error': err }"
            :name="props.name"
            :id="props.name"
            :disabled="props.disabled ?? false"
            :placeholder="props.placeholder ?? ' '"
            :required="props.required"
            :autocomplete="props.autocomplete"
        />

        <label :for="props.name" class="s-input-label">{{ label }}</label>

        <div
            v-if="err"
            class="s-input-error"
            ref="err"
            @mouseenter="setPopover(true)"
            @mouseleave="setPopover(false)"
        >
            <SyncIcon icon="error" :size="24" class="error-icon" />

            <!-- TODO: Use proper tooltip system -->
            <Teleport to="#overlays" v-if="showPopover">
                <div class="error-tooltip" ref="err-popup" :style="floatingStyles">
                    {{ err }}
                </div>
            </Teleport>
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
    &:focus,
    .always-float-label & {
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
    z-index: 1000;
}

/* Show on hover */
.s-input-error:hover .error-tooltip {
    opacity: 1;
    visibility: visible;
}

.always-float-label .s-input-input::placeholder {
    color: var(--s-text-subtler) !important;
}
</style>
