<script setup lang="ts">
import { useRoute } from 'vue-router'

import UserContextMenu from '../components/user/user-context-menu.vue';

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
