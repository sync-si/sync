<script setup lang="ts">
import FullscreenButton from '../buttons/FullscreenButton.vue'
import MuteButton from '../buttons/MuteButton.vue'
import PlayButton from '../buttons/PlayButton.vue'
import ChapterTitle from '../ChapterTitle.vue'
import TimeSlider from '../sliders/TimeSlider.vue'
import VolumeSlider from '../sliders/VolumeSlider.vue'
import TimeGroup from '../TimeGroup.vue'
import VideoCaptions from '../VideoCaptions.vue'
import SyncButton from '../../button/sync-button.vue'

defineProps<{
    isOwner: boolean
    sidebarOpen: boolean
}>()

const emit = defineEmits<{
    toggleSidebar: []
}>()
</script>

<template>
    <VideoCaptions />

    <media-controls class="vds-controls controls">
        <div class="sidebar-toggle-wrapper">
            <SyncButton
                class="sidebar-toggle-btn"
                :class="{ 'sidebar-closed': !sidebarOpen }"
                bstyle="none"
                color="bgnb"
                icon="arrow_forward"
                @click="emit('toggleSidebar')"
            />
        </div>

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
.sidebar-toggle-wrapper {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 10;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
}

[data-visible] .sidebar-toggle-wrapper {
    opacity: 1;
    pointer-events: auto;
}

.sidebar-toggle-btn {
    opacity: 0.8;
    transition:
        opacity 0.2s ease,
        transform 0.3s ease;
}

.sidebar-toggle-btn:hover {
    opacity: 1;
}

.sidebar-toggle-btn :deep(svg) {
    fill: white;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
}

.sidebar-toggle-btn.sidebar-closed {
    transform: rotate(180deg);
}

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
