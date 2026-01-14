<script setup lang="ts">
import { useToastStore } from '../../stores/toast'
import SyncToast from './sync-toast.vue'

const toastStore = useToastStore()
</script>

<template>
    <div class="toast-container">
        <TransitionGroup name="toast">
            <SyncToast v-for="toast in toastStore.toasts" :key="toast.id" :toast="toast" />
        </TransitionGroup>
    </div>
</template>

<style scoped>
.toast-container {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    pointer-events: auto;
}

.toast-enter-active {
    animation: toast-slide-in 0.3s ease-out;
}

.toast-leave-active {
    animation: toast-slide-out 0.3s ease-in forwards;
}

@keyframes toast-slide-in {
    from {
        opacity: 0;
        transform: translateY(-100%);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes toast-slide-out {
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0;
        transform: translateY(-100%);
    }
}
</style>
