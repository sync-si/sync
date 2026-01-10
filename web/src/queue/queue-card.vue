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
    <div class="q-card">
        <!-- <SyncButton
            v-if="props.inQueue && props.isAdmin"
            :icon="props.playing ? 'playing' : 'handle'"
            :color="props.playing ? 'white' : 'bgnb'"
            bstyle="none"
        /> -->
        <div class="q-card-head">
            <span class="title">{{ props.media.title }}</span>
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
                    v-if="props.isAdmin"
                    icon="play"
                    :color="props.playing ? 'white' : 'bgnb'"
                    bstyle="none"
                    @click="$emit('play')"
                />
                <SyncButton
                    v-if="props.isAdmin && (props.inQueue || props.isSuggestion)"
                    icon="queue_add"
                    :color="props.playing ? 'white' : 'bgnb'"
                    bstyle="none"
                    @click="$emit('addToQueue')"
                />
            </div>
        </div>
        <div class="q-card-body">
            <div class="thumbnail">
                <img :src="props.media.thumbnail" :alt="`${props.media.title}'s Thumbnial'`" />
                <span class="duration">{{ props.media.duration }}</span>
            </div>
            <span class="description">{{ props.media.description }}</span>
        </div>
    </div>
</template>

<style scoped>
.q-card {
    display: flex;
    flex-direction: column;
}

.q-card-head {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.actions {
    display: flex;
    justify-content: space-evenly;
}

.q-card-body {
    display: flex;
    flex-direction: row;
}
</style>
