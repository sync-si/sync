<script setup lang="ts">
import { ref } from 'vue'
import SyncInput from '../input/sync-input.vue'
import SyncButton from '../button/sync-button.vue'

const props = defineProps<{
    roomName: string
    roomId: string
}>()

// frys in the bag solution
const roomNameModel = ref(props.roomName)
const roomIdModel = ref(props.roomId)
</script>

<template>
    <div class="r-settings shadow-medium">
        <div class="r-settings-head">
            <span class="r-settings-title">Room settings</span>
            <SyncButton @click="$emit('close')" icon="close" color="bgnb" bstyle="none" />
        </div>
        <div class="r-settings-body">
            <span class="general-zone-title">General</span>
            <SyncInput v-model="roomNameModel" name="room-name" label="Room Name" />
            <SyncInput v-model="roomIdModel" name="room-id" label="Room ID" :disabled="true" />
            <hr class="s-separator" />
            <div class="danger-zone-title">
                <svg width="20" height="20" class="warning-icon">
                    <use :href="`/__spritemap#sprite-warning`" />
                </svg>
                <span>Danger zone</span>
            </div>
            <SyncButton
                class="icon-danger"
                text="Kick users"
                icon="remove"
                color="background"
                bstyle="small"
                @click="$emit('kickAll')"
            />
            <SyncButton
                class="icon-danger"
                text='"Nuke" room'
                icon="explosion"
                color="background"
                bstyle="small"
                @click="$emit('nuke')"
            />
        </div>
        <div class="r-settings-footer">
            <SyncButton @click="$emit('discard')" text="Discard" bstyle="pill" color="primary-lt" />
            <SyncButton @click="$emit('save')" text="Save" bstyle="pill" color="primary-lt" />
        </div>
    </div>
</template>

<style scoped>
.r-settings {
    position: absolute;
    display: flex;
    flex-direction: column;

    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    width: 400px;
    padding: 16px;
    gap: 16px;

    border: 1px solid var(--s-border);
    border-radius: 16px;

    font-family: var(--s-font);
}

.r-settings-head {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    & :deep(svg) {
        fill: var(--s-text-subtle) !important;
    }
}

.r-settings-title {
    font-size: 24px;
    font-weight: var(--s-weight-bold);
    color: var(--s-primary);
}

.r-settings-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.general-zone-title {
    font-size: 20px;
    font-weight: var(--s-weight-bold);
}

.danger-zone-title {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    font-weight: var(--s-weight-bold);

    font-size: 20px;
    color: var(--s-error-dark);
    & :deep(svg) {
        fill: var(--s-error-dark) !important;
    }
}

.icon-danger :deep(svg) {
    fill: var(--s-error) !important;
}

.r-settings-footer {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
}
</style>
