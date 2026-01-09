<script setup lang="ts">
import { ref, nextTick } from 'vue'
import SyncButton from '../button/sync-button.vue'

const message = ref('')

function send(e: Event) {
    if (!message.value.trim()) return

    emit('send', message.value)
    message.value = ''
    nextTick(() => autoResizeTextarea(e.target as HTMLInputElement))
}

function onInput(e: Event) {
    autoResizeTextarea(e.target as HTMLInputElement)
}

function autoResizeTextarea(textarea: HTMLInputElement) {
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
}

const emit = defineEmits<{
    (e: 'send', message: string): void
}>()
</script>

<template>
    <div class="c-text-field">
        <div class="c-input">
            <textarea
                v-model="message"
                class="c-textarea"
                placeholder="Write something..."
                @keydown.enter.exact.prevent="send"
                @input="onInput"
            />
            <SyncButton class="icon-gray" icon="smile" color="bgnb" bstyle="none" />
        </div>
        <span class="char-limit">{{ message.length }}/300</span>
    </div>
</template>

<style scoped>
.c-text-field {
    display: flex;
    flex-direction: column;

    width: 100%;
    background-color: var(--s-background-alt);

    border-top: 1px solid var(--s-border);

    font-family: var(--s-font);
}

.c-input {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 10px;
}

.c-textarea {
    flex-grow: 1;
    font-size: 16px;
    line-height: 1.2;
    max-height: 5lh;
}

.icon-gray {
    flex-shrink: 1;
    & :deep(svg) {
        fill: var(--s-text-subtle) !important;
    }
}

.char-limit {
    padding: 0 5px 0 5px;
    display: flex;
    justify-content: flex-end;
    font-size: 10px;
}

textarea {
    border: none;
    overflow-y: auto;
    outline: none;
    background: none;
    min-height: 1.2em;

    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    box-shadow: none;

    resize: none;
}
</style>
