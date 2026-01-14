<script setup lang="ts">
import MediaCard from './media-card.vue'

const states = ['active', 'played', 'queued', 'suggestion'] as const
</script>

<template>
    <Story title="Media/Card" :layout="{ type: 'grid', width: '400px' }">
        <Variant v-for="state in states" :key="state" :title="`Media Card - ${state}`">
            <MediaCard
                :can-play="true"
                :can-queue="true"
                :can-remove="true"
                :can-suggest="true"
                :state="state"
                :media="{
                    kind: 'videoFile',
                    title: 'gooned-so-long.mp4',
                    source: 'https://ubel.weebify.tv/gooned-so-long.mp4',
                    size: 3_524_123,
                    duration: 620,
                    mime: 'video/mp4',
                }"
            />
        </Variant>
    </Story>
</template>
