<script setup lang="ts">
import { useRoute } from 'vue-router'

import UserRoom from '../components/identity/user-room.vue';
import UserLabel from '../components/identity/user-label.vue';
import UserContextMenu from '../components/identity/user-context-menu.vue';

const route = useRoute()
</script>

<template>
    <!-- <UserRoom 
    username="neki" 
    image=" https://www.gravatar.com/avatar/09abd59eb5653a7183ba812b8261f48b" 
    :is-self=true
    :is-online=false 
    @select="console.log('fetch data')" /> -->
    <UserContextMenu username="Neki" :is-admin="true" />
</template>
