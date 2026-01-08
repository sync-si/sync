<script setup lang="ts">
const props = defineProps <{
    username: string
    image: string
    isSelf: boolean
    isOnline: boolean


}>()

const emit = defineEmits<{
    (e: 'select'): void
}>()
</script>

<template>
    <img 
    class="avatar" 
    :class="[{'self' : props.isSelf}, {'offline' : !props.isOnline}]" 
    :src="props.image" :alt="`${props.username}'s Avatar'`"
    @click="$emit('select')">
</template>

<style scoped>

.avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid transparent;
}

.self {
    border-color: var(--s-primary);
}

.offline {
    opacity: 0.5;
}

</style>