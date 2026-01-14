<script setup lang="ts">
import FullscreenButton from '../buttons/FullscreenButton.vue'
import MuteButton from '../buttons/MuteButton.vue'
import PlayButton from '../buttons/PlayButton.vue'
import ChapterTitle from '../ChapterTitle.vue'
import TimeSlider from '../sliders/TimeSlider.vue'
import VolumeSlider from '../sliders/VolumeSlider.vue'
import TimeGroup from '../TimeGroup.vue'
import VideoCaptions from '../VideoCaptions.vue'

defineProps<{
    isOwner: boolean
}>()
</script>

<template>
    <VideoCaptions />
    <media-controls class="vds-controls controls">
        <div class="vds-controls-spacer" />
        <media-controls-group class="vds-controls-group controls-group">
            <TimeSlider :isOwner="isOwner" />
        </media-controls-group>
        <media-controls-group class="vds-controls-group controls-group">
            <PlayButton v-if="isOwner" tooltip-placement="top start" />
            <MuteButton tooltip-placement="top" />
            <VolumeSlider />
            <TimeGroup />
            <ChapterTitle />
            <div class="vds-controls-spacer" />
            <FullscreenButton tooltip-placement="top end" />
        </media-controls-group>
    </media-controls>
</template>

<style scoped>
.controls :deep(media-time-slider) {
    --media-slider-height: 40px;
}

.controls :deep(media-time-slider media-slider-value) {
    background-color: unset;
}

.controls :deep(media-volume-slider) {
    --media-slider-height: 40px;
    --media-slider-preview-offset: 32px;
    margin-left: 1.5px;
    max-width: 80px;
}

.controls-group {
    display: flex;
    align-items: center;
    width: 100%;
}
.controls-group {
    padding-inline: 8px;
}
.controls-group:last-child {
    margin-top: -4px;
    padding-bottom: 8px;
}
</style>
