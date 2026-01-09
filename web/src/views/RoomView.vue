<script setup lang="ts">
import { useRoute } from 'vue-router'

import UserContextMenu from '../components/user/user-context-menu.vue'
import ChatTextField from '../components/chat/chat-text-field.vue'

const route = useRoute()
</script>

<template>
    <!-- <UserRoom 
    username="neki" 
    image=" https://www.gravatar.com/avatar/09abd59eb5653a7183ba812b8261f48b" 
    :is-self=true
    :is-online=false 
    @select="console.log('fetch data')" /> -->
    <ChatTextField />
</template>
