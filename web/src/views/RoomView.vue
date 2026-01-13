<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { onMounted, ref } from 'vue'
import { useRoomStore } from '../stores/room'
import SyncIcon from '../components/icon/sync-icon.vue'
import UserRoom from '../components/user/user-room.vue'
import SyncButton from '../components/button/sync-button.vue'
import ChatTextField from '../components/chat/chat-text-field.vue'
import ChatMessage from '../components/chat/chat-message.vue'

const sessionStore = useSessionStore()
const roomStore = useRoomStore()
const router = useRouter()

const sidePanelOpen = ref(true)

const props = defineProps<{
    roomId: string
}>()

function roomActivateSession() {
    if (!sessionStore.activeSession) {
        console.log('[RoomView] Trying to get stored session for room', props.roomId)

        // no session is active, but we might have one stored...
        const potentialSession = sessionStore.getSession(props.roomId)

        if (potentialSession) {
            sessionStore.activateSession(potentialSession)
        }
    }

    if (!sessionStore.activeSession) {
        console.log('[RoomView] No sessions for room', props.roomId)

        // still no session, send the user to the join page
        router.replace({ name: 'joinRoom', params: { roomId: props.roomId } })
        return
    }

    // we have an active session
    console.log('[RoomView] Activated session for room', props.roomId)

    //TODO: $reset?
    roomStore.connect(sessionStore.activeSession!)
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
            <UserRoom
                :username="roomStore.ownerUser?.name ?? ''"
                :gravatarHash="roomStore.ownerUser?.gravatarHash ?? ''"
                :is-online="roomStore.ownerUser?.state === 'present'"
                :is-self="roomStore.ownerId === roomStore.self?.id"
            />
            <hr class="s-separator" />

            <div class="users-scroll-wrapper">
                <div class="users-scroll">
                    <UserRoom
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
            <h1>Room {{ props.roomId }}</h1>

            <pre>
RoomLoading: {{ roomStore.roomLoading }} ({{ roomStore.roomLoadingProgress }})</pre
            >
            <pre>RoomFailState: {{ roomStore.roomFailState }}</pre>
            <pre>Reconnect State: {{ roomStore.reconnectState }}</pre>
            <pre>Time: {{ roomStore.time }}</pre>
            <pre>Self: {{ roomStore.self }}</pre>
            <pre>RoomInfo: {{ roomStore.roomInfo }}</pre>
            <pre>OwnerId: {{ roomStore.ownerId }}</pre>
            <pre>RoomUsers: {{ roomStore.roomUsers }}</pre>
            <pre>Playlist: {{ roomStore.playlist }}</pre>
            <pre>SyncState: {{ roomStore.syncState }}</pre>
            <pre>Chat: {{ roomStore.chat }}</pre>
            <pre>UidUsernameCache: {{ roomStore.uidUsernameCache }}</pre>

            <SyncButton
                bstyle="mat"
                color="primary"
                text="Toggle side panel"
                @click="sidePanelOpen = !sidePanelOpen"
            />
        </div>

        <div class="side-wrapper" :class="{ closed: !sidePanelOpen }">
            <div class="side shadow-medium">
                <div class="room-title">
                    <span>{{ roomStore.roomInfo?.name ?? '' }}</span>
                    <SyncButton bstyle="none" color="bgnb" icon="share" />
                    <SyncButton bstyle="none" color="bgnb" icon="settings" />
                </div>

                <div class="search">
                    <span>search is being worked on</span>
                    <SyncButton bstyle="none" color="bgnb" icon="playlist" />
                </div>

                <div class="playlist"></div>

                <div class="chat">
                    <ChatMessage
                        v-for="i in 100"
                        :key="i"
                        :username="'aaa'"
                        :timestamp="new Date()"
                        :text="'Hello world! This is a test message. AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'"
                    />
                </div>

                <ChatTextField />
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
    padding: 1rem;
    overflow: auto;

    background-color: black;
    color: white;

    border-radius: 16px;
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

    span {
        flex: 1;
    }
}

.playlist {
    flex: 1 0;
}

.chat {
    flex: 2 0;
    overflow: hidden scroll;
}
</style>
