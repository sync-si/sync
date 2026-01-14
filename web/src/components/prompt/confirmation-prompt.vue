<script setup lang="ts">
import SyncButton from '../button/sync-button.vue'

const props = defineProps<{
    title: string
    primaryBtnText: string
    isDanger: boolean

    secondaryBtnText?: string
}>()
</script>

<template>
    <div class="prompt shadow-medium">
        <div class="prompt-head">
            <span class="title">{{ props.title }}</span>
            <SyncButton @click="$emit('close')" icon="close" bstyle="none" color="bgnb" />
        </div>
        <div class="prompt-body"><slot></slot></div>
        <div class="prompt-footer">
            <SyncButton
                v-if="props.secondaryBtnText"
                @click="$emit(props.secondaryBtnText.toLowerCase())"
                :text="props.secondaryBtnText"
                bstyle="pill"
                color="primary-lt"
            />
            <SyncButton
                @click="$emit(props.primaryBtnText.toLowerCase())"
                :text="props.primaryBtnText"
                bstyle="pill"
                :color="props.isDanger ? 'danger-lt' : 'primary-lt'"
            />
        </div>
    </div>
</template>

<style scoped>
.prompt {
    position: absolute;
    display: flex;
    flex-direction: column;

    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    width: 374px;
    padding: 16px;
    gap: 16px;

    border: 1px solid var(--s-border);
    border-radius: 16px;
    box-sizing: border-box;
}

.prompt-head {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.title {
    font-size: 24px;
    font-weight: var(--s-weight-bold);
    color: var(--s-primary);
}

.prompt-body {
    font-size: 16px;
}

.prompt-footer {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
}
</style>
