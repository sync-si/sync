<script setup lang="ts">
import { ref } from 'vue'
import SyncButton from '../components/button/sync-button.vue'
import SyncIcon from '../components/icon/sync-icon.vue'
import SyncInput from '../components/input/sync-input.vue'
import { useRouter } from 'vue-router'

// TODO: get actual version from package.json!
const version = 'v3.0.0-infdev'

const router = useRouter()

const name = ref('')

function create() {
    router.push({
        name: 'create',
        query: { name: name.value },
    })
}
</script>

<template>
    <main>
        <div id="logo">
            <SyncIcon class="icon" :size="128" icon="sync" />
            <h1>Sync</h1>
        </div>

        <div id="create-room">
            <SyncInput
                class="shadow-low"
                name="roomName"
                label="Room Name"
                v-model="name"
                @keydown.enter="create"
            />
            <SyncButton
                class="shadow-low"
                bstyle="mat"
                color="primary"
                text="Create room"
                @click="create"
            />
        </div>

        <footer>
            {{ version }} | <a class="s-link" href="https://github.com/sync-si/sync">GitHub</a>
        </footer>
    </main>
</template>

<style scoped>
main {
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 2rem;
}

#logo {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
}

#create-room {
    display: flex;
    flex-direction: row;
    gap: 8px;
}

h1 {
    font-size: 96px;
    font-weight: 400;
    color: var(--s-text);
    margin: 0;
    filter: drop-shadow(0 0 48px var(--s-primary));
}

.icon {
    filter: drop-shadow(0 0 48px var(--s-primary));
}

footer {
    color: var(--s-text-subtle);
    position: absolute;
    bottom: 16px;
}
</style>
