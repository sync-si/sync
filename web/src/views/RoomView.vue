<script setup lang="ts">
import RoomSettings from '../components/room/room-settings.vue'

// import { useRoute } from 'vue-router'

// const route = useRoute()
</script>

<template>
    <!-- <UserRoom 
    username="neki" 
    image=" https://www.gravatar.com/avatar/09abd59eb5653a7183ba812b8261f48b" 
    :is-self=true
    :is-online=false 
    @select="console.log('fetch data')" /> -->
    <RoomSettings room-name="Balbal" room-id="roomid" />
</template>
