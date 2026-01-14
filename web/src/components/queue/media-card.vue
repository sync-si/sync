<script setup lang="ts">
import type { MediaBody } from '@sync/wire'
import SyncButton from '../button/sync-button.vue'
import { secondsToDuration } from '../../util/time'
import { computed } from 'vue'

type PlayState = 'active' | 'played' | 'queued' | 'suggestion'

const props = defineProps<{
    media: MediaBody

    canPlay?: boolean
    canQueue?: boolean
    canRemove?: boolean
    canSuggest?: boolean
    canDismiss?: boolean

    state: PlayState
}>()

const description = computed(() =>
    [
        props.media.size ? `Size: ${(props.media.size / (2 << 20)).toFixed(0)} MiB` : undefined,
        props.media.mime ? `Type: ${props.media.mime}` : undefined,
    ]
        .filter((x) => !!x)
        .join('\n'),
)

defineEmits<{
    play: []
    queue: []
    delete: []
    suggest: []
    dismiss: []
}>()
</script>

<template>
    <div class="media-card" :class="[`ps-${state}`]">
        <div class="media-card-head">
            <span class="title">{{ media.title }}</span>
            <div class="actions">
                <SyncButton
                    v-if="canRemove"
                    bstyle="none"
                    icon="delete"
                    :color="state === 'active' ? 'white' : 'bgnb'"
                    @click="$emit('delete')"
                />
                <SyncButton
                    v-if="canSuggest"
                    bstyle="none"
                    icon="suggest"
                    :color="state === 'active' ? 'white' : 'bgnb'"
                    @click="$emit('suggest')"
                />
                <SyncButton
                    v-if="canPlay"
                    icon="play_arrow"
                    bstyle="none"
                    color="bgnb"
                    @click="$emit('play')"
                />
                <SyncButton
                    v-if="canQueue"
                    icon="queue_add"
                    color="bgnb"
                    bstyle="none"
                    @click="$emit('queue')"
                />
                <SyncButton
                    v-if="canDismiss"
                    icon="close"
                    color="bgnb"
                    bstyle="none"
                    @click="$emit('dismiss')"
                />
            </div>
        </div>
        <div class="media-card-body">
            <div class="thumbnail" :style="`background-image: url('${media.thumbnail}');`">
                <span v-if="media.duration" class="duration">{{
                    secondsToDuration(media.duration)
                }}</span>
            </div>
            <span class="description">{{ description }}</span>
        </div>
    </div>
</template>

<style scoped>
.media-card {
    display: flex;
    flex-direction: column;
    padding: 8px;
    gap: 6px;
    font-family: var(--s-font);
}

.media-card.ps-suggestion {
    border: 1px solid var(--s-border);
    border-radius: 8px;
}

.media-card.ps-active {
    background-color: var(--s-primary);
    color: white;
    & :deep(svg) {
        fill: var(--s-background) !important;
    }
}

.media-card.ps-played {
    color: var(--s-text-subtler);
}

.already-played img {
    opacity: 0.8;
}

.media-card-head {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.title {
    font-size: 16px;
    font-weight: var(--s-weight-bold);
}

.actions {
    display: flex;
    justify-content: space-evenly;
    gap: 10px;
}

.media-card-body {
    display: flex;
    flex-direction: row;
    gap: 8px;
}

.thumbnail {
    position: relative;
    height: 60px;
    width: 100px;
    background-size: cover;
    background-position: center;
    border-radius: 12px;
    background-color: var(--s-border);
}

.duration {
    font-size: 12px;
    font-weight: var(--s-weight-bold);
    padding: 3px;
    position: absolute;
    color: var(--s-background);
    bottom: 8px;
    right: 8px;
    background-color: rgba(0, 0, 0, 0.75);
    border-radius: 4px;
}

.description {
    white-space: pre-line;
}
</style>
