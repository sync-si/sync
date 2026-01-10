<script setup lang="ts"></script>

<template>
    <router-view />
    <div id="overlays"></div>
</template>

<style scoped>
* {
    font-family: var(--s-font);
    color: var(--s-text);
}

#app {
    margin: 0;
    padding: 0;
    background-color: var(--s-background);
}

#overlays {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}
</style>
