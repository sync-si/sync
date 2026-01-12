<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSessionStore } from '../stores/session'
import { onMounted } from 'vue'
import { useRoomStore } from '../stores/room'

const sessionStore = useSessionStore()
const roomStore = useRoomStore()
const router = useRouter()

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
    <h1>Room {{ props.roomId }}</h1>

    <pre>RoomLoading: {{ roomStore.roomLoading }} ({{ roomStore.roomLoadingProgress }})</pre>
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
</template>
