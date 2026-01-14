<script setup lang="ts">
import ChatMessage from './chat-message.vue'
import SyncButton from '../button/sync-button.vue'
import { ref, watch, nextTick } from 'vue'
import type { ChatMessage as TChatMessage } from '@sync/wire'

const props = defineProps<{
    msgs: TChatMessage[]
    usernameMap: Map<string, string>
}>()

const chatBox = ref<HTMLElement | null>(null)
const showBtn = ref(false)
let isScrolling = false

watch(props.msgs, async () => {
    if (showBtn.value) return
    await nextTick()
    scrollDown()
})

function onScroll(e: Event) {
    if (isScrolling == true) return
    const target = e.target as HTMLElement
    if (target.scrollHeight - target.scrollTop - target.clientHeight > 10) {
        showBtn.value = true
    } else showBtn.value = false
}
function scrollDown() {
    if (chatBox.value) {
        isScrolling = true
        showBtn.value = false
        chatBox.value.scrollTo({
            top: chatBox.value.scrollHeight,
            behavior: 'smooth',
        })
        setTimeout(() => {
            isScrolling = false
        }, 500)
    }
}

function resolveUsername(msg: TChatMessage) {
    if (msg.type === 'system') return 'System'
    return props.usernameMap.get(msg.userId) ?? msg.userId.substring(0, 5)
}
</script>

<template>
    <div class="chat-wrapper" ref="chatBox" @scroll="onScroll">
        <div class="chat">
            <ChatMessage
                v-for="msg in props.msgs"
                :key="msg.timestamp"
                :username="resolveUsername(msg)"
                :timestamp="new Date(msg.timestamp)"
                :text="msg.text"
            />
        </div>
        <SyncButton
            v-if="showBtn"
            @click="scrollDown"
            class="scroll-down-btn shadow-medium"
            icon="arrow_down"
            color="primary"
            bstyle="small"
        />
    </div>
</template>

<style scoped>
.chat-wrapper {
    position: relative;
    flex: 2 0;
    overflow: hidden scroll;
}

.scroll-down-btn {
    position: sticky;
    bottom: 20px;
    float: right;
    right: 10px;

    & :deep(svg) {
        fill: var(--s-background) !important;
    }
}
</style>
