<script setup lang="ts">
import type { TIconName } from './icons';

const props = defineProps<{
    icon: TIconName & (string & {})
    size?: number
    w?: number
    h?: number
}>();

</script>

<template>
    <svg :width="w ?? size ?? 24" :height="h ?? size ?? 24">
        <use :href="`/__spritemap#sprite-${props.icon}`" />
    </svg>
</template>