<script setup lang="ts">
import SyncButton from './components/button/sync-button.vue';
import SyncIcon from './components/icon/sync-icon.vue';
</script>

<template>
    <h1>Sync3-web</h1>
    <SyncIcon icon="arrow_forward" />
    <SyncButton text="Hello world!" :bstyle="'pill'" :color="'primary'" />
</template>

<style scoped>
h1 {
    color: var(--s-primary-dark);
}

* {
    font-family: var(--s-font);
    color: var(--s-text);
}

body,
#app {
    background-color: var(--s-background);
}
</style>
