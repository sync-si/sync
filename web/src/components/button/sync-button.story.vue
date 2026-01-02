<script setup lang="ts">
import SyncButton from './sync-button.vue'

const roundnessOptions = ['min', 'pill'] as const
const colorOptions = ['primary', 'primary-lt', 'danger', 'danger-lt', 'background'] as const
const disabledOptions = [false, true] as const
</script>

<template>
    <Story :layout="{ type: 'grid', width: '200px' }">
        <template v-for="r in roundnessOptions" :key="r">
            <template v-for="c in colorOptions" :key="c">
                <template v-for="d in disabledOptions" :key="d.toString()">
                    <Variant :title="`Button - r:${r} c:${c} d:${d}`">
                        <SyncButton text="Button" :roundness="r" :color="c" :disabled="d" />
                    </Variant>
                </template>
            </template>
        </template>
    </Story>
</template>
