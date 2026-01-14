<script setup lang="ts">
import ChatMessage from './chat-message.vue'
import SyncButton from '../button/sync-button.vue'
import ChatTextField from './chat-text-field.vue'
import { watch, nextTick, useTemplateRef, onMounted } from 'vue'
import type { ChatMessage as TChatMessage } from '@sync/wire'
import { useScroll } from '@vueuse/core'

const props = defineProps<{
    msgs: TChatMessage[]
    usernameMap: Map<string, string>
    isOwner: boolean
}>()

const emit = defineEmits<{
    send: [msg: string]
    play: [token: string]
    queue: [token: string]
}>()

const chatBottom = useTemplateRef('chatBottom')
const chatWrapper = useTemplateRef('chatWrapper')
const { arrivedState, isScrolling } = useScroll(chatWrapper)

watch(props.msgs, () => {
    if (arrivedState.bottom) {
        nextTick(() => scrollDown(true))
    }
})

function scrollDown(smooth: boolean = true) {
    chatBottom.value?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
}

function resolveUsername(msg: TChatMessage) {
    if (msg.type === 'system') return 'System'
    return props.usernameMap.get(msg.userId) ?? msg.userId.substring(0, 5)
}

function resolveRecommendation(msg: TChatMessage) {
    if (msg.type === 'system') return undefined
    return msg.recommendation
}

onMounted(() => {
    scrollDown(false)
})

function sendMessage(text: string) {
    emit('send', text)
    nextTick(() => scrollDown(true))
}
</script>

<template>
    <div class="room-chat">
        <div class="chat-content-container">
            <div class="chat-content-scroller" ref="chatWrapper">
                <ChatMessage
                    v-for="msg in props.msgs"
                    :key="msg.timestamp"
                    :username="resolveUsername(msg)"
                    :timestamp="new Date(msg.timestamp)"
                    :text="msg.text"
                    :is-owner="isOwner"
                    :recommendation="resolveRecommendation(msg)"
                    @play="$emit('play', $event)"
                    @queue="$emit('queue', $event)"
                />

                <div ref="chatBottom"></div>
            </div>

            <SyncButton
                v-if="!(arrivedState.bottom || isScrolling)"
                @click="scrollDown"
                class="scroll-down-btn shadow-medium"
                icon="arrow_down"
                color="primary"
                bstyle="small"
            />
        </div>

        <ChatTextField class="chat-text-field" @send="sendMessage($event)" />
    </div>
</template>

<style scoped>
.room-chat {
    display: flex;
    flex-direction: column;
    position: relative;
}

.chat-content-container {
    flex: 1 1;
    min-height: 0;
    position: relative;
    overflow: hidden;
}

.chat-content-scroller {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden scroll;
}

.scroll-down-btn {
    position: absolute;
    bottom: 20px;
    float: right;
    right: 10px;
}
</style>
