<script setup lang="ts">
import { ICONS } from './icons';
import SyncIcon from './sync-icon.vue';
</script>

<template>
    <Story :layout="{ type: 'grid', width: '64px' }">
        <Variant v-for="i in ICONS" :key="i" :title="i">
            <SyncIcon :icon="i" />
        </Variant>
    </Story>
</template>
