<script setup lang="ts">
import { ref } from 'vue';
import SyncButton from '../button/sync-button.vue';
import SyncIcon from '../icon/sync-icon.vue';
import SyncInput from '../input/sync-input.vue';

const emit = defineEmits<{
    (e: 'use', username: string, gravatar: string | undefined): void;
}>();

const expanded = ref(false);

function toggle() {
    expanded.value = !expanded.value;
}

</script>

<template>
    <div class="s-new-identity">

        <div class="top">

            <div class="plus">
                <SyncIcon icon="add" :size="24" />
            </div>

            <span class="title">New Identity</span>

            <SyncButton class="animate-rotate" :class="{ expanded }" bstyle="circle" icon="arrow_down"
                color="primary-lt" @click="toggle()" />

        </div>

        <div class="expand" :class="{ expanded }">
            <div class="form">
                <div class="empty"></div>

                <SyncInput name="username" label="Username" />
                <SyncInput name="gravatar" label="Gravatar Email" placeholder="person@example.com" />

                <SyncButton class="ralign" bstyle="pill" color="primary-lt" text="Go" />
            </div>
        </div>

    </div>
</template>

<style scoped>
.s-new-identity {
    display: flex;
    flex-direction: column;
    min-width: 350px;

    box-sizing: border-box;

    font-family: var(--s-font);
    font-size: 18px;

    padding: 11px;
    border-radius: 35px;
    border: 1px solid var(--s-border);
}

.top {
    display: flex;
    flex-direction: row;
    align-items: center;

    gap: 8px;
}

.plus {
    display: block;
    padding: 12px;
    height: 24px;
}

.title {
    font-weight: var(--s-weight-bold);
    flex-grow: 1;
}


.expand {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.15s ease;
}

.expand.expanded {
    grid-template-rows: 1fr;
}


.form {
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 8px;

    align-items: stretch;
}

.ralign {
    align-self: end;
}

/* .no-shrink {
    flex-shrink: 0;
}




.username {
    color: var(--s-text-subtle);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
} */

/* .delete {
    margin-right: 12px;
} */


.animate-rotate :deep(svg) {
    transition: transform 0.15s ease;
}

.expanded :deep(svg) {
    transform: rotate(180deg);
}
</style>