<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useIdentityStore } from '../stores/identity'
import UserIdentity from '../components/identity/user-identity.vue'
import NewIdentity from '../components/identity/new-identity.vue'
import { computeGravatarHash } from '../util/gravatar'
import { useSessionStore } from '../stores/session'
import { router } from '../router'
import { useToastStore } from '../stores/toast'

const identityStore = useIdentityStore()
const sessionStore = useSessionStore()

const slide = ref(1)
const joinInfo = ref<{ name: string }>()
const randomName = `Anon#${crypto.randomUUID().slice(0, 5)}`
const randomGravatar = computeGravatarHash(randomName)

const props = defineProps<{
    roomId: string
}>()

const error = ref<string>()

const toast = useToastStore()

async function use(username: string, gravatar: string | undefined, anon: boolean = false) {
    const gravatarHash = gravatar ?? computeGravatarHash(username)

    slide.value = 3

    if (!anon)
        identityStore.addIdentity({
            name: username,
            gravatarHash,
        })

    try {
        const result = await sessionStore.joinRoom(props.roomId, username, gravatarHash)

        if (result.success) {
            sessionStore.activateSession(result.data)
            router.replace({ name: 'room', params: { roomId: result.data.roomSlug } })
        } else {
            toast.error(`Failed to join room: ${result.error}`)
            slide.value = 1
        }
    } catch (e) {
        console.error(e)
        toast.error(`Failed to join room`)
        slide.value = 1
    }
}

onMounted(async () => {
    const r = await sessionStore.getJoinInfo(props.roomId)

    if (r.success) {
        joinInfo.value = r.data
        slide.value = 2
    } else {
        error.value = r.error
        slide.value = 1
    }
})
</script>

<template>
    <main>
        <h1 v-if="!joinInfo">Join a room</h1>
        <h1 v-else>Join {{ joinInfo.name }}</h1>

        <div class="slide1" v-if="slide == 1">
            <span v-if="!error">loading...</span>
            <span v-else>{{ error }}</span>
        </div>

        <div class="slide2" v-else-if="slide == 2">
            <UserIdentity
                title="Anonymous"
                :allow-delete="false"
                :username="randomName"
                :image="randomGravatar"
                @select="use(randomName, randomGravatar, true)"
            />

            <NewIdentity @use="use" />

            <UserIdentity
                v-for="(id, i) in identityStore.recentIdentities"
                :key="`${id.name}-${id.gravatarHash}`"
                :title="`Recent Identity ${i + 1}`"
                :username="id.name"
                :image="id.gravatarHash"
                :allow-delete="true"
                @delete="identityStore.removeIdentityByValue(id)"
                @select="use(id.name, id.gravatarHash)"
            />
        </div>

        <div v-else>Joining...</div>
    </main>
</template>

<style scoped>
main {
    height: 100vh;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}

#create-form {
    display: flex;
    flex-direction: column;
    align-items: end;
    gap: 1rem;
}

h1 {
    margin: 0;
    font-size: 40px;
    font-weight: var(--s-weight-light);
}

.w350 {
    width: 350px;
}

.slide2 {
    padding: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    height: 50vh;
    max-height: 50vh;
    overflow: hidden auto;
    scrollbar-arrow-color: transparent;
    scrollbar-gutter: stable both-edges;
}
</style>
