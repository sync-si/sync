<script setup lang="ts">
import SyncButton from '../components/button/sync-button.vue'

//placeholder interface
export interface MediaBody {
    iat: number

    kind: 'videoFile'

    title: string
    source: string
    thumbnail?: string
    duration?: number

    // hrib added
    description?: string
}

const props = defineProps<{
    media: MediaBody
    isAdmin: boolean
    inQueue: boolean
    isSuggestion: boolean

    alreadyPlayed?: boolean
    playing?: boolean
}>()
</script>

<template>
    <div
        class="media-card"
        :class="[{ playing: props.playing }, { 'border-subtle': props.isSuggestion }]"
    >
        <div class="media-card-head">
            <span class="title" :class="{ 'already-played': props.alreadyPlayed }">{{
                props.media.title
            }}</span>
            <div class="actions">
                <SyncButton
                    v-if="props.isAdmin && props.inQueue"
                    icon="delete"
                    :color="props.playing ? 'white' : 'bgnb'"
                    bstyle="none"
                    @click="$emit('delete')"
                />
                <SyncButton
                    v-if="!props.inQueue && !props.isSuggestion"
                    icon="suggest"
                    :color="props.playing ? 'white' : 'bgnb'"
                    bstyle="none"
                    @click="$emit('suggest')"
                />
                <SyncButton
                    :class="{ playing: props.playing }"
                    v-if="props.isAdmin"
                    icon="play_arrow"
                    color="bgnb"
                    bstyle="none"
                    @click="$emit('play')"
                />
                <SyncButton
                    :class="{ playing: props.playing }"
                    v-if="props.isAdmin && (props.inQueue || props.isSuggestion)"
                    icon="queue_add"
                    color="bgnb"
                    bstyle="none"
                    @click="$emit('addToQueue')"
                />
            </div>
        </div>
        <div class="media-card-body">
            <div class="thumbnail" :class="{ 'already-played': props.alreadyPlayed }">
                <img :src="props.media.thumbnail" :alt="`${props.media.title}'s Thumbnial'`" />
                <span class="duration">20:20</span>
            </div>
            <span class="description" :class="{ 'already-played': props.alreadyPlayed }">{{
                props.media.description
            }}</span>
        </div>
    </div>
</template>

<style scoped>
.media-card {
    display: flex;
    flex-direction: column;
    padding: 8px;
    gap: 6px;
}

.border-subtle {
    border: 1px solid var(--s-border);
    border-radius: 8px;
}

.playing {
    background-color: var(--s-primary);
    color: white;
    & :deep(svg) {
        fill: var(--s-background) !important;
    }
}

.already-played {
    color: var(--s-text-subtle);
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
    &:deep(svg) {
        fill: var(--s-text-subtle);
    }
}

.media-card-body {
    display: flex;
    flex-direction: row;
    gap: 8px;
}

.thumbnail {
    max-width: 103px;
    position: relative;
}

.thumbnail img {
    max-width: inherit;
    border-radius: 12px;
}

.duration {
    font-size: 12px;
    padding: 3px;
    position: absolute;
    color: var(--s-background);
    bottom: 11px;
    right: 8px;
    background-color: rgba(0, 0, 0, 0.75);
    border-radius: 4px;
}
</style>
