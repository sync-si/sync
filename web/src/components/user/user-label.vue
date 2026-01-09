<script setup lang="ts">
const props = defineProps<{
    username: string
    isAdmin: boolean
    isContextM: boolean
    // position: {x: number, y: number}
    // adminAction: boolean

    // timeConnected?: number
    // ping?: number
    // error?: number
    // buffer?: number
}>()

// const emits = defineEmits<{
//     (e: 'promote'): void
//     (e: 'remove'): void
// }>()
</script>

<template>
    <div class="user-label" :class="[{ 'label-container shadow-high': !isContextM }]">
        <span class="username">{{ props.username }}</span>
        <span class="role">{{ props.isAdmin ? 'Admin' : 'User' }}</span>
    </div>
</template>

<style scoped>
.user-label {
    display: flex;
    flex-direction: column;
    font-family: var(--s-font);
}

.label-container {
    position: absolute;
    min-width: 146px;

    padding: 4px 8px 4px 8px;
    border: 1px solid var(--s-border);
    border-radius: 8px;

    box-sizing: border-box;

    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.username {
    font-size: 20px;
    font-weight: var(--s-weight-bold);
}

.role {
    font-size: 16px;
    color: var(--s-text-subtle);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
