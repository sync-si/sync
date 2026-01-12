<script setup lang="ts">
import ConfirmationPrompt from '../components/prompt/confirmation-prompt.vue'

// import { useRoute } from 'vue-router'

// import UserContextMenu from '../components/user/user-context-menu.vue'
// import MediaCard from '../queue/media-card.vue'

// const route = useRoute()
</script>

<template>
    <!-- <UserRoom 
    username="neki" 
    image=" https://www.gravatar.com/avatar/09abd59eb5653a7183ba812b8261f48b" 
    :is-self=true
    :is-online=false 
    @select="console.log('fetch data')" /> -->
    <!-- <MediaCard
        :media="{
            iat: 1,
            kind: 'videoFile',
            title: 'test test',
            source: 'blalalal',
            thumbnail: 'https://picsum.photos/1280/720',
            duration: 20,
            description: 'blblblb',
        }"
        :is-admin="true"
        :in-queue="false"
        :is-suggestion="true"
        :already-played="false"
        :playing="false"
    /> -->
    <!-- <UserContextMenu username="neki" :is-admin="false" /> -->
    <ConfirmationPrompt
        title="Test test"
        primary-btn-text="Test"
        :is-danger="true"
        secondary-btn-text="test2"
    >
        Test test Test test Test test Test test Test test Test test Test test Test test
    </ConfirmationPrompt>
</template>
