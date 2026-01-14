<template>
    <div class="vds-time-group">
        <media-time class="vds-time" type="current" />
        <div class="vds-time-divider">/</div>
        <media-time class="vds-time" type="duration" />
    </div>
</template>

<style scoped>
.vds-time-group,
.vds-time-group :deep(*) {
    margin-left: 8px;
    font-family: var(--s-font) !important;
    font-weight: var(--s-weight-normal) !important;
    color: white !important;
    text-shadow: 0 0 4px #000 !important;
}
</style>
