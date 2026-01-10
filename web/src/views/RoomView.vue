<script setup lang="ts">
// import { useRoute } from 'vue-router'

import QueueCard from '../queue/queue-card.vue'

// const route = useRoute()
</script>

<template>
    <!-- <UserRoom 
    username="neki" 
    image=" https://www.gravatar.com/avatar/09abd59eb5653a7183ba812b8261f48b" 
    :is-self=true
    :is-online=false 
    @select="console.log('fetch data')" /> -->
    <QueueCard
        :media="{
            iat: 1,
            kind: 'videoFile',
            title: 'test test',
            source: 'blalalal',
            thumbnail: 'https://www.gravatar.com/avatar/09abd59eb5653a7183ba812b8261f48b',
            duration: 20,
            description: 'blblblb',
        }"
        :is-admin="true"
        :in-queue="false"
        :is-suggestion="true"
    />
</template>
