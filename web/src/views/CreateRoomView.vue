<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import SyncButton from '../components/button/sync-button.vue'
import SyncInput from '../components/input/sync-input.vue'
import { useRegle, type RegleExternalErrorTree } from '@regle/core'
import { minLength, maxLength, regex, required } from '@regle/rules'
import slugify from 'slugify'
import { emptyNull } from '../util/form'
import { watchDebounced } from '@vueuse/core'
import { useIdentityStore } from '../stores/identity'
import UserIdentity from '../components/identity/user-identity.vue'
import NewIdentity from '../components/identity/new-identity.vue'
import { computeGravatarHash } from '../util/gravatar'
import { useSessionStore } from '../stores/session'
import { router } from '../router'
import { useToastStore } from '../stores/toast'

const identityStore = useIdentityStore()
const sessionStore = useSessionStore()
const toast = useToastStore()

const SLUG_OPTIONS = {
    lower: true,
    strict: true,
}
const SLUG_REGEX = /^[a-z0-9-]{1,64}$/
const slide = ref(1)

const props = defineProps<{
    name?: string
}>()

const form = reactive({
    name: props.name ?? '',
    slug: '',
})

const extErrors = ref<RegleExternalErrorTree<typeof form>>({})

const randomName = `Anon#${crypto.randomUUID().slice(0, 5)}`
const randomGravatar = computeGravatarHash(randomName)

const { r$ } = useRegle(
    form,
    {
        name: {
            required,
            minLength: minLength(1),
            maxLength: maxLength(64),
        },
        slug: {
            minLength: minLength(1),
            maxLength: maxLength(64),
            regex: regex(SLUG_REGEX),
        },
    },
    {
        autoDirty: true,
        externalErrors: extErrors,
    },
)

const autoSlug = computed(() => {
    return slugify(r$.$value.name, SLUG_OPTIONS)
})

const currentSlug = computed(() => emptyNull(r$.$value.slug) ?? autoSlug.value)

watchDebounced(
    currentSlug,
    async (slug) => {
        if (!SLUG_REGEX.test(slug)) return

        const r = await fetch('/api/room/canCreate/' + slug, { method: 'POST' })

        extErrors.value = r.status === 409 ? { slug: ['Room already exists'] } : {}
    },
    { debounce: 500, immediate: true },
)

function toIdentity() {
    if (r$.$invalid) return

    slide.value = 2
}

async function use(username: string, gravatar: string | undefined, anon: boolean = false) {
    const gravatarHash = gravatar ?? computeGravatarHash(username)

    slide.value = 3

    if (!anon)
        identityStore.addIdentity({
            name: username,
            gravatarHash,
        })

    try {
        const result = await sessionStore.createRoom(
            form.name,
            currentSlug.value,
            username,
            gravatarHash,
        )

        if (result.success) {
            sessionStore.activateSession(result.data)
            router.replace({ name: 'room', params: { roomId: result.data.roomSlug } })
        } else {
            toast.error(`Failed to create room: ${result.error}`)
            slide.value = 1
        }
    } catch {
        toast.error(`Error creating room`)
        slide.value = 1
    }
}
</script>

<template>
    <main>
        <h1>Create a Room</h1>

        <div v-if="slide == 1" id="create-form" @keydown.enter="toIdentity">
            <SyncInput
                class="w350 shadow-low"
                name="roomName"
                label="Room Name"
                v-model="r$.$value.name"
                :err="r$.name.$errors[0]"
            />
            <SyncInput
                class="w350 shadow-low"
                name="slug"
                label="Custom URL"
                v-model="r$.$value.slug"
                :placeholder="autoSlug"
                :always-float-label="autoSlug.length > 0"
                :err="r$.slug.$errors[0]"
            />

            <SyncButton
                class="shadow-low"
                bstyle="mat"
                color="primary"
                text="Create room"
                :disabled="r$.$invalid"
                @click="toIdentity"
            />
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

        <div v-else>Creating...</div>
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
