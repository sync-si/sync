<script setup lang="ts">
const props = defineProps<{
    thumbnails?: string
    isOwner: boolean
}>()

function cprevent(e: MouseEvent) {
    if (!props.isOwner) {
        e.preventDefault()
        e.stopPropagation()
    }
}
</script>

<template>
    <media-time-slider
        class="vds-time-slider vds-slider"
        @mousedown.capture="cprevent"
        @pointerdown.capture="cprevent"
        @click.capture="cprevent"
    >
        <media-slider-chapters
            class="vds-slider-chapters"
            @mousedown.capture="cprevent"
            @pointerdown.capture="cprevent"
            @click.capture="cprevent"
        >
            <template>
                <div
                    class="vds-slider-chapter"
                    @mousedown.capture="cprevent"
                    @pointerdown.capture="cprevent"
                    @click.capture="cprevent"
                >
                    <div
                        class="vds-slider-track"
                        @mousedown.capture="cprevent"
                        @pointerdown.capture="cprevent"
                        @click.capture="cprevent"
                    />
                    <div
                        class="vds-slider-track-fill vds-slider-track"
                        @mousedown.capture="cprevent"
                        @pointerdown.capture="cprevent"
                        @click.capture="cprevent"
                    />
                    <div
                        class="vds-slider-progress vds-slider-track"
                        @mousedown.capture="cprevent"
                        @pointerdown.capture="cprevent"
                        @click.capture="cprevent"
                    />
                </div>
            </template>
        </media-slider-chapters>

        <div class="vds-slider-thumb" />

        <!-- Slider Preview -->
        <media-slider-preview
            class="vds-slider-preview"
            @mousedown.capture="cprevent"
            @pointerdown.capture="cprevent"
            @click.capture="cprevent"
        >
            <media-slider-thumbnail
                @mousedown.capture="cprevent"
                @pointerdown.capture="cprevent"
                @click.capture="cprevent"
                class="vds-slider-thumbnail vds-thumbnail"
                :src="thumbnails"
                v-if="thumbnails"
            />

            <div
                class="vds-slider-chapter-title"
                data-part="chapter-title"
                @mousedown.capture="cprevent"
                @pointerdown.capture="cprevent"
                @click.capture="cprevent"
            />

            <media-slider-value
                @mousedown.capture="cprevent"
                @pointerdown.capture="cprevent"
                @click.capture="cprevent"
                class="vds-slider-value"
            />
        </media-slider-preview>
    </media-time-slider>
</template>
