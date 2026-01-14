<script setup lang="ts">
import { gravatarUrl } from '../../util/gravatar'

const props = defineProps<{
    username: string
    gravatarHash: string
    isSelf: boolean
    isOnline: boolean
}>()
</script>

<template>
    <div class="avatar">
        <img
            :class="{ offline: !props.isOnline }"
            :src="gravatarUrl(props.gravatarHash)"
            :alt="`${props.username}'s Avatar'`"
            @click="$emit('select')"
        />
        <div class="self" v-if="isSelf"></div>
    </div>
</template>

<style scoped>
.avatar,
.avatar > img,
.avatar > .self {
    width: 48px;
    height: 48px;
    border-radius: 50%;
}

.avatar {
    position: relative;
}

.self {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    box-shadow: inset 0 0 0 2px var(--s-primary);
}

.offline {
    opacity: 0.5;
}
</style>
