<script setup lang="ts">
import SyncButton from '../button/sync-button.vue';

const props = defineProps<{
    title: string;
    username: string;
    image: string;

    allowDelete?: boolean;
    preferred?: boolean;
}>();

const emit = defineEmits<{
    (e: 'delete'): void;
    (e: 'select'): void;
}>();

</script>

<template>
    <div class="s-identity">

        <img class="avatar" :src="props.image" :alt="`${username}'s Avatar`" />

        <div class="midstack">

            <span class="title">{{ props.title }}</span>
            <span class="username">{{ props.username }}</span>

        </div>


        <SyncButton v-if="allowDelete" class="no-shrink delete" bstyle="none" icon="delete" color="bgnb"
            @click="emit('delete')" />

        <SyncButton class="no-shrink" bstyle="circle" icon="arrow_forward" :color="preferred ? 'primary' : 'primary-lt'"
            @click="emit('select')" />
    </div>
</template>

<style scoped>
.s-identity {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    min-width: 350px;

    box-sizing: border-box;

    font-family: var(--s-font);
    font-size: 18px;

    padding: 11px;
    border-radius: 999px;
    border: 1px solid var(--s-border);
}

.avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
}

.no-shrink {
    flex-shrink: 0;
}

.midstack {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex-grow: 1;
    overflow: hidden;
}

.title {
    font-weight: var(--s-weight-bold);
}

.username {
    color: var(--s-text-subtle);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.delete {
    margin-right: 12px;
}
</style>