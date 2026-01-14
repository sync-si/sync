<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { onMounted, ref } from 'vue'
import { useRoomStore } from '../stores/room'
import SyncIcon from '../components/icon/sync-icon.vue'
import RoomUser from '../components/user/room-user.vue'
import SyncButton from '../components/button/sync-button.vue'
import SearchBox from '../components/input/search-box.vue'
import MediaQueue from '../components/queue/media-queue.vue'
import RoomChat from '../components/chat/room-chat.vue'
import SyncPlayer from '../components/player/SyncPlayer.vue'

const sessionStore = useSessionStore()
const roomStore = useRoomStore()
const router = useRouter()

const props = defineProps<{
    roomId: string
}>()

const sidePanelOpen = ref(true)
const showQueue = ref(true)

function roomActivateSession() {
    if (!sessionStore.activeSession) {
        console.log('[RoomView] Trying to get stored session for room', props.roomId)
        const potentialSession = sessionStore.getSession(props.roomId)

        if (potentialSession) {
            sessionStore.activateSession(potentialSession)
        }
    }

    if (!sessionStore.activeSession) {
        console.log('[RoomView] No sessions for room', props.roomId)
        router.replace({ name: 'joinRoom', params: { roomId: props.roomId } })
        return
    }

    console.log('[RoomView] Activated session for room', props.roomId)
    roomStore.connect(sessionStore.activeSession!)
    //TODO: $reset?
}

onMounted(() => {
    roomActivateSession()
})
</script>

<template>
    <main>
        <div id="users" class="shadow-medium">
            <SyncIcon :size="48" icon="sync" />

            <hr class="s-separator" />

            <RoomUser
                :username="roomStore.ownerUser?.name ?? ''"
                :gravatarHash="roomStore.ownerUser?.gravatarHash ?? ''"
                :is-online="roomStore.ownerUser?.state === 'present'"
                :is-self="roomStore.isOwner"
            />

            <hr class="s-separator" />

            <div class="users-scroll-wrapper">
                <div class="users-scroll">
                    <RoomUser
                        v-for="user in roomStore.normalUsers"
                        :key="user.id"
                        :username="user.name"
                        :gravatarHash="user.gravatarHash"
                        :is-online="user.state === 'present'"
                        :is-self="user.id === roomStore.self?.id"
                    />
                </div>
            </div>
        </div>

        <div id="media">
            <SyncPlayer
                :is-owner="roomStore.isOwner"
                :sync-state="roomStore.syncState"
                :time="roomStore.time"
                @sync="(e) => roomStore.isOwner && roomStore.sync(e)"
                @struggle="null"
            />
        </div>

        <div class="side-wrapper" :class="{ closed: !sidePanelOpen }">
            <div class="side shadow-medium">
                <div class="room-title">
                    <span>{{ roomStore.roomInfo?.name ?? '' }}</span>
                    <SyncButton bstyle="none" color="bgnb" icon="share" />
                    <SyncButton
                        v-if="roomStore.isOwner"
                        bstyle="none"
                        color="bgnb"
                        icon="settings"
                    />
                </div>

                <div class="search">
                    <SearchBox
                        :session-key="sessionStore.activeSession?.sessionToken ?? ''"
                        :is-owner="roomStore.isOwner"
                        @play="roomStore.playAndClearPlaylist($event)"
                        @queue="roomStore.addToPlaylist($event).then(() => (showQueue = true))"
                        @suggest="roomStore.sendChat(undefined, $event.token)"
                    />
                    <SyncButton
                        bstyle="none"
                        color="bgnb"
                        icon="playlist"
                        :class="{ 'q-shown': showQueue }"
                        @click="showQueue = !showQueue"
                    />
                </div>

                <MediaQueue
                    class="playlist"
                    :class="{ 'q-shown': showQueue }"
                    :queue="roomStore.playlist ?? []"
                    :active-media-token="roomStore.activeMediaToken"
                    :is-owner="roomStore.isOwner"
                    @play="roomStore.sync({ state: 'paused', media: $event.token, position: 0 })"
                    @delete="roomStore.deleteFromPlaylist($event)"
                />

                <pre>{{ roomStore.syncState }}</pre>

                <RoomChat
                    class="chat"
                    :msgs="roomStore.chat"
                    :username-map="roomStore.uidUsernameCache"
                    @send="roomStore.sendChat($event)"
                />
            </div>
        </div>
    </main>
</template>

<style scoped>
main {
    display: flex;
    flex-direction: row;
    justify-content: stretch;
    height: 100vh;
    box-sizing: border-box;

    padding-block: 16px;
    gap: 16px;
    overflow: hidden;
}

.s-separator {
    margin: 0;
}

#users {
    display: flex;
    flex-direction: column;
    width: 64px;
    outline: 1px solid var(--s-border);
    padding: 8px;
    box-sizing: border-box;
    border-radius: 0 16px 16px 0;
    gap: 8px;

    & > * {
        flex-shrink: 0;
    }
}

.users-scroll-wrapper {
    position: relative;
    margin-top: -8px;
    flex: 1;
}

.users-scroll-wrapper::before,
.users-scroll-wrapper::after {
    width: 48px;
    content: '';
    position: absolute;
    z-index: 10;
}

.users-scroll-wrapper::before {
    top: 0;
    height: 12px;
    background: linear-gradient(white, rgba(255, 255, 255, 0.001));
}

.users-scroll-wrapper::after {
    bottom: 0;
    height: 25px;
    background: linear-gradient(rgba(255, 255, 255, 0.001), white);
}

.users-scroll {
    position: absolute;

    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    overflow: hidden scroll;
    scrollbar-width: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 8px;
}

#media {
    flex-grow: 1;
    overflow: hidden;
    background-color: black;
    border-radius: 16px;

    position: relative;
}

.side-wrapper {
    width: 400px;

    transition: width 0.3s ease;

    &.closed {
        width: 0;
    }
}

.side {
    width: 400px;
    height: 100%;

    display: flex;
    flex-direction: column;
    outline: 1px solid var(--s-border);
    box-sizing: border-box;
    border-radius: 16px 0 0 16px;
    gap: 8px;
    overflow: hidden;
}

.room-title {
    padding: 8px;
    padding-bottom: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-self: center;
    gap: 8px;

    span {
        flex: 1;

        text-wrap: none;
        overflow: hidden;
        text-overflow: ellipsis;

        font-size: 20px;
        font-weight: var(--s-weight-bold);
    }
}

.search {
    padding: 4px 8px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-self: center;
    gap: 8px;

    .search-box {
        flex: 1;
    }
}

.playlist {
    flex: 0 0 0;
    overflow: hidden auto;
    transition: flex-grow 0.3s ease;
    border-bottom: 1px solid var(--s-border);
}

.playlist.q-shown {
    flex: 1 0 0;
}

.chat {
    min-height: 0;
    flex: 2 0 0;
}

button.q-shown :deep(:not(:hover) svg) {
    fill: var(--s-primary);
}
</style>
