<script setup lang="ts">
import SyncButton from '../button/sync-button.vue'
import UserLabel from './user-label.vue'

const props = defineProps<{
    username: string
    isAdmin: boolean

    timeConnected?: number
    ping?: number
    error?: number
    buffer?: number
}>()
</script>

<template>
    <div class="user-context-menu shadow-high">
        <UserLabel :username="props.username" :is-admin="props.isAdmin" :is-context-m="true" />
        <hr class="s-separator" />
        <div class="s-status">
            <span class="t-bold">Sync Status</span>
            <div class="u-connected">
                <span>Connected:</span>
                <span>{{ props.timeConnected ?? 'NaN' }}</span>
            </div>
            <div class="u-stats">
                <div class="ping stat">
                    <span class="t-bold">Ping</span>
                    <span>{{ props.ping ?? 'NaN' }}</span>
                </div>
                <div class="error stat">
                    <span class="t-bold">Error</span>
                    <span>{{ props.error ?? 'NaN' }}</span>
                </div>
                <div class="buffer stat">
                    <span class="t-bold">Buffer</span>
                    <span>{{ props.buffer ?? 'NaN' }}</span>
                </div>
            </div>
        </div>
        <hr class="s-separator" />
        <div class="admin-actions">
            <SyncButton
                @click="$emit('promote')"
                class="icon-gold"
                text="Promote"
                icon="promote"
                bstyle="small"
                color="background"
            />
            <SyncButton
                @click="$emit('remove')"
                class="icon-red"
                text="Remove"
                icon="remove"
                bstyle="small"
                color="background"
            />
        </div>
    </div>
</template>

<style scoped>
.user-context-menu {
    position: absolute;
    min-width: 289px;

    display: flex;
    flex-direction: column;

    font-family: var(--s-font);

    padding: 4px 10px 4px 10px;
    border: 1px solid var(--s-border);
    border-radius: 16px;

    box-sizing: border-box;

    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.s-status {
    font-size: 16px;
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.u-connected {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.u-stats {
    display: flex;
    flex-direction: row;
    gap: 4px;
}

.stat {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.t-bold {
    font-weight: var(--s-weight-bold);
}

.admin-actions {
    display: flex;
    flex-direction: row;
    gap: 4px;
    & > * {
        flex: 1;
    }
}

.icon-gold :deep(svg) {
    fill: var(--s-gold) !important;
}
.icon-red :deep(svg) {
    fill: var(--s-error) !important;
}
</style>
