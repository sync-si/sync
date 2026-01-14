<script setup lang="ts">
import { computed, nextTick, ref, type ComponentPublicInstance } from 'vue'
import type { MediaJWT } from '../../util/mediajwt'
import MediaCard from './media-card.vue'
import { VueDraggable } from 'vue-draggable-plus'
import { useRoomStore } from '../../stores/room'
import SyncIcon from '../icon/sync-icon.vue'
import { useToastStore } from '../../stores/toast'

const store = useRoomStore()

const props = defineProps<{
    queue: MediaJWT[]
    activeMediaToken: string | undefined
    isOwner?: boolean
}>()

const activeIdx = computed(() => {
    if (!props.activeMediaToken) return -1
    return props.queue.findIndex((item) => item.token === props.activeMediaToken)
})

defineEmits<{
    play: [MediaJWT]
    delete: [MediaJWT]
}>()

const busy = ref(false)

const toast = useToastStore()

const queueView = computed({
    get() {
        return props.queue
    },

    async set(newQueue: MediaJWT[]) {
        try {
            busy.value = true
            await store.updatePlaylist(newQueue)
        } catch {
            toast.error('Could not update playlist order')
        } finally {
            busy.value = false
        }
    },
})

function scrollActive(el: ComponentPublicInstance | null, token: string) {
    if (!el) return

    if (token !== props.activeMediaToken) return

    console.log(el)

    nextTick(() =>
        (el.$el as Element | null)?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' }),
    )
}
</script>

<template>
    <div class="queue" :class="{ busy, owner: isOwner }">
        <VueDraggable :disabled="!isOwner" v-model="queueView" handle=".low-taper-fade">
            <div
                class="draggable-container"
                v-for="(item, idx) in queueView"
                :key="item.token"
                :class="{ active: idx === activeIdx }"
            >
                <!-- We dragging low taper fade into vue.js -->
                <!-- (((still massive))) -->

                <SyncIcon class="low-taper-fade" v-if="idx !== activeIdx && isOwner" icon="drag" />

                <MediaCard
                    class="mc"
                    :ref="(el) => scrollActive(el as ComponentPublicInstance | null, item.token)"
                    :can-play="isOwner && idx !== activeIdx"
                    :can-remove="isOwner && idx !== activeIdx"
                    :state="idx === activeIdx ? 'active' : idx < activeIdx ? 'played' : 'queued'"
                    :media="item"
                    @play="$emit('play', item)"
                    @delete="$emit('delete', item)"
                />
            </div>
        </VueDraggable>
    </div>
</template>

<style scoped>
.queue.busy {
    pointer-events: none;
    opacity: 0.6;
}

.draggable-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;

    &.active {
        background-color: var(--s-primary);
    }

    .mc {
        flex: 1;
    }
}

.owner .active {
    padding-left: 28px;
}

.low-taper-fade {
    cursor: grab;
    fill: var(--s-text-subtler) !important;
}
</style>
