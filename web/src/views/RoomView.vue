<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { type ComponentPublicInstance, computed, onMounted, ref, useTemplateRef } from 'vue'
import { RoomFailState, useRoomStore } from '../stores/room'
import SyncIcon from '../components/icon/sync-icon.vue'
import RoomUser from '../components/user/room-user.vue'
import SyncButton from '../components/button/sync-button.vue'
import SearchBox from '../components/input/search-box.vue'
import MediaQueue from '../components/queue/media-queue.vue'
import RoomChat from '../components/chat/room-chat.vue'
import SyncPlayer from '../components/player/SyncPlayer.vue'
import UserContextMenu from '../components/user/user-context-menu.vue'
import { offset, useFloating } from '@floating-ui/vue'
import type { WireUser } from '@sync/wire'
import { onClickOutside, useEventListener, useTitle } from '@vueuse/core'
import RoomSettings from '../components/room/room-settings.vue'
import { useToastStore } from '../stores/toast'

const router = useRouter()
const toast = useToastStore()
const roomStore = useRoomStore()
const sessionStore = useSessionStore()

const selectedUserComponent = ref<Element | ComponentPublicInstance | null>(null)
const dialog = useTemplateRef<HTMLElement>('dialog')
const selectedUser = ref<WireUser | null>(null)
const { floatingStyles } = useFloating(selectedUserComponent, dialog, {
    placement: 'right',
    middleware: [offset(32)],
})

onClickOutside(dialog, () => {
    selectedUser.value = null
})

useEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        selectedUser.value = null
    }
})

const props = defineProps<{
    roomId: string
}>()
const sidePanelOpen = ref(true)
const showQueue = ref(true)
const showRoomSettings = ref(false)

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

function selectUser(user: WireUser | null) {
    if (!roomStore.isOwner) return
    roomStore.queryPlayback(user?.id ?? '')
    selectedUser.value = user
}

function remove(user: WireUser) {
    roomStore.kickUser(user.id)
    selectedUser.value = null
}

function promote(user: WireUser) {
    roomStore.promote(user.id)
    selectedUser.value = null
}

function copyRoomLink() {
    const roomLink = window.location.href
    navigator.clipboard.writeText(roomLink).then(() => {
        console.log('[RoomView] Copied room link to clipboard:', roomLink)
        toast.success('Room link copied to clipboard')
    })
}

onMounted(() => {
    roomActivateSession()
})

const title = computed(() => `${roomStore.roomInfo?.name ?? 'Room'} - Sync`)
useTitle(title)

function closeRoomSettings() {
    showRoomSettings.value = false
}
</script>

<template>
    <main>
        <Teleport to="#overlays" v-if="selectedUserComponent && selectedUser">
            <UserContextMenu
                ref="dialog"
                :style="floatingStyles"
                :username="selectedUser.name"
                :is-admin="false"
                :timestamp="selectedUser.lastStateChange"
                :present="selectedUser.state === 'present'"
                :ping="roomStore.playbackReports.get(selectedUser.id)?.stats.latency"
                :error="roomStore.playbackReports.get(selectedUser.id)?.stats.offset"
                :buffer="roomStore.playbackReports.get(selectedUser.id)?.stats.buffer"
                @promote="promote(selectedUser)"
                @remove="remove(selectedUser)"
            />
        </Teleport>

        <Teleport to="#modals" v-if="showRoomSettings">
            <div class="gray-out" @click.self="closeRoomSettings">
                <RoomSettings @close="closeRoomSettings" />
            </div>
        </Teleport>

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
                        @click="selectUser(user)"
                        :ref="
                            (el) => {
                                if (selectedUser?.id == user.id) selectedUserComponent = el
                            }
                        "
                    />
                </div>
            </div>
        </div>

        <div id="media">
            <SyncPlayer
                :is-owner="roomStore.isOwner"
                :sync-state="roomStore.syncState"
                :time="roomStore.time"
                :sidebar-open="sidePanelOpen"
                @sync="(e) => roomStore.isOwner && roomStore.sync(e)"
                @struggle="null"
                @toggle-sidebar="sidePanelOpen = !sidePanelOpen"
            />
        </div>

        <div class="side-wrapper" :class="{ closed: !sidePanelOpen }">
            <div class="side shadow-medium">
                <div class="room-title">
                    <span>{{ roomStore.roomInfo?.name ?? '' }}</span>
                    <SyncButton bstyle="none" color="bgnb" icon="share" @click="copyRoomLink" />
                    <SyncButton
                        v-if="roomStore.isOwner"
                        bstyle="none"
                        color="bgnb"
                        icon="settings"
                        @click="showRoomSettings = true"
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

                <RoomChat
                    class="chat"
                    :is-owner="roomStore.isOwner"
                    :msgs="roomStore.chat"
                    :username-map="roomStore.uidUsernameCache"
                    @send="roomStore.sendChat($event)"
                    @play="roomStore.sync({ state: 'paused', media: $event, position: 0 })"
                    @queue="roomStore.addToPlaylist($event).then(() => (showQueue = true))"
                />

                <div id="loading" v-if="roomStore.roomLoading">
                    <h1>Loading</h1>
                    <span v-if="roomStore.roomLoadingProgress === 0">Waiting for server hello</span>
                    <span v-else>Synchronizing clock {{ roomStore.roomLoadingProgress }} / 5</span>
                </div>

                <div id="error" v-if="roomStore.roomFailState !== RoomFailState.Ok">
                    <h1>Error</h1>
                    <div v-if="roomStore.roomFailState === RoomFailState.Closed">
                        <span>Room was closed by owner.</span>
                    </div>
                    <div v-else-if="roomStore.roomFailState === RoomFailState.ConnectedElsewhere">
                        <span>Your session has connected from another tab.</span>
                    </div>
                    <div v-else-if="roomStore.roomFailState === RoomFailState.Kicked">
                        <span>You have been kicked from the room.</span>
                    </div>
                    <div v-else-if="roomStore.roomFailState === RoomFailState.Failed">
                        <span>The connection to the room server failed.</span>
                    </div>
                    <div v-else>
                        <span>An unknown error occurred.</span>
                    </div>

                    <SyncButton
                        bstyle="pill"
                        color="danger-lt"
                        text="Home"
                        @click="router.replace('/')"
                    />
                </div>
            </div>
        </div>
    </main>
</template>

<style scoped>
main {
    position: relative;
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
    z-index: 0;
}

.users-scroll-wrapper::before,
.users-scroll-wrapper::after {
    width: 48px;
    content: '';
    position: absolute;
    z-index: 1;
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

    overflow: visible scroll;
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

#loading,
#error {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--s-background);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 200;
}

#error {
    h1 {
        color: var(--s-error);
    }
}

.gray-out {
    background-color: #0004;
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: all;
    z-index: 300;
}
</style>
