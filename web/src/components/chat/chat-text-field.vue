<script setup lang="ts">
import { ref, nextTick } from 'vue'
// import SyncButton from '../button/sync-button.vue'

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
                name="c-textarea"
                placeholder="Write something..."
                rows="1"
                maxlength="300"
                @keydown.enter.exact.prevent="send"
                @input="onInput"
            />
            <!-- TODO: emoji -->
            <!-- <SyncButton class="icon-gray" icon="smile" color="bgnb" bstyle="small" /> -->
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
    align-items: baseline;
    padding-top: 8px;
}

.c-textarea {
    flex-grow: 1;
    font-size: 14px;
    line-height: 1.2;
    max-height: 5lh;
    font-family: var(--s-font);

    padding-left: 10px;
    box-sizing: border-box;
}

.icon-gray {
    flex-shrink: 1;
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
    padding: 0;

    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    box-shadow: none;

    resize: none;
}
</style>
