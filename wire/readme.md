![Sync proto](https://ubel.weebify.tv/sync-proto.svg)

# Sync protocol V3v2.1 (proposed)

A REST+WS protocol for synchronized video watching and chat.

WIP draft, will change during implementation.

## Connecting to the server

First lets describe the connection lifecycle.

### Create a session

Send a REST request to either create or join a room. This will create a user session in the `new` state .

### Connect to the session

Open a websocket connection with your session token.

When user first connects, room members will get a `userJoin` message, indicating a new user has joined the room.

If this was a reconnect, the server will instead send a `userState` message with `'present'` state.

Your client will receive a `roomHello` message with current room state.

### Synchronize your clock

To ensure proper ordering of messages, clients should send a few `ping` messages to the server to estimate clock offset and network latency.

### Ready

Your client should now be fully initalized and ready to start playing video and interacting with the room.

### Reconnects, kicks and leaves

When a user disconnects, their session will be kept alive for a short period of time (30 seconds?).

The server will send a `userState` message with `'disconnected'` state to all room members.

If the session is not reconnected within the timeout, the server will send a `userLeave` message to all room members and remove the session.

Users can explicitly leave the room (destroying the session) by closing their connection by closing with the reason `leave`.

If a user is kicked from the room, the close reason will be `kick`.

If owner destroys the room the reason will be `roomClosed`.

## Entities

Entities used in the protocol:

### `RoomInfo`

```ts
type RoomInfo = {
    slug: string;
    name: string;
};
```

### `WireRoom`

```ts

type WireRoom = {
    room: RoomInfo;
    ownerId: string;
    users: WireUser[];
    chat: ChatMessage[]; // last N messages (30?)
    sync: SyncPayload;
    playlist: Media[];
}

```

### `WireUser`

```ts

type WireUser = {
    id: string;
    name: string;
    gravatarHash: string;
    
    state: 'present' | 'disconnected';
    lastStateChange: number; // timestamp in milliseconds
}

```

### `Media` JWT body

```ts

type MediaBody = {
    iat: number; // issued at timestamp in seconds

    kind: 'videoFile'; // might introduce 'mpegDash', 'youtube', ...

    title: string; // title
    source: string; // source URL
    thumbnail?: string; // thumbnail URL
    duration?: number; // duration in seconds
    size?: number; // size in bytes
    mimeType?: string; // MIME type
}

```

## REST endpoints

### `POST /room/canCreate/:id`

Queries availability of a room ID. Returns one of

- `200 OK` - room ID is available
- `409 Conflict` - room ID is already taken
- `400 Bad Request` - room ID is invalid

### `POST /room/create`

Creates a new room. Request body:

```ts
type CreateRoomRequest = {
    roomName: string;
    roomSlug: string;

    displayName: string;
    gravatarHash: string;
}
```

Returns `201 Created` with body:

```ts
type CreateRoomResponse = {
    roomSlug: string;
    sessionToken: string;

    you: WireUser;
};
```

Or 409, 400 on error.

### `POST /room/join`

Joins an existing room. Request body:

```ts

type JoinRoomRequest = {
    roomSlug: string;
    
    displayName: string;
    gravatarHash: string;
}

```

Returns `200 OK` with body:

```ts

type JoinRoomResponse = {
    roomSlug: string;
    sessionToken: string;

    you: WireUser;
}

```

or 404, 400 on error.

### `POST /media/check`

Checks a media file and signs a JWT media token. Request body:

```ts

type CheckMediaRequest = {
    type: 'videoFile';
    url: string;
};

```

Returns `200 OK` with media token:

```ts
type CheckMediaResponse = string; //JWT, see MediaBody
```

or 400 with error message.

### `[WS] GET /session/connect/:token`

Upgrades to a websocket connection for the given session token.

or 400 on error.

## WS message structure

All websocket messages are structured like:

```ts
interface Msg {
    // identifier to be able to identify responses
    id?: number

    // identifier of the message this is a reply to
    replyTo?: number

    // Message type; this will imply the body
    type: string

    // Message payload, can be null for trivial messages
    body: unknown
}
```

## WS Client->Server messages

### `ping`

Sent by the client to measure latency and clock offset. The server will reply with a `pong` message.

```ts
type PingPayload = null
```

### `message`

Sent by the client to send a chat message to the room.

```ts
// a JWT token of a validated video source
type Media = string;

type MessagePayload = {
    text: string;
} | {
    text?: string;
    recommendation: Media;
};
```

Replies/related: `chatMessage`, `error`

### `sync` (owner only)

Sent by the client to update the room state (video playback position, etc.)

```ts
// a JWT token of a validated video source
type Media = string;

type SyncIdle = {
    state: 'idle';
}

type SyncPaused = {
    state: 'paused';
    
    media: Media;
    position: number; // in milliseconds
}

type SyncPlaying = {
    state: 'playing';

    media: Media;
    offset: number; // in milliseconds
    rate: number; // playback rate (should probaly always be 1.0)
}

type SyncPayload = SyncIdle | SyncPaused | SyncPlaying;

```

Replies/related: `ssync`, `error`

### `kick` (owner only)

Sent by the client to kick a user from the room.

```ts

type KickPayload = {
    userId: string;
}

```

Replies/related: `userLeave`, `error`

### `clearChat` (owner only)

Sent by the client to clear the chat history.

```ts
type ClearChatPayload = null;
```

Replies/related: `chatCleared`, `error`

### `updateRoom` (owner only)

Sent by the client to configure the room.

```ts
type UpdateRoomPayload = {
    name?: string;
};
```

Replies/related: `roomUpdated`, `error`

### `kickAll` (owner only)

Sent by the client to kick all other users from the room.

```ts
type KickAllPayload = null;
```

Replies/related: multiple `roomUpdated`, `error`

### `destroyRoom` (owner only)

Sent by the client to destroy the room.

```ts
type DestroyRoomPayload = null;
```

Replies/related: nothing (connection close)

### `queryPlayback` (owner only)

Sent by the client to query a user's stats.

```ts
type QueryPlaybackPayload = {
    userId: string;
}
```

Replies/related: `playbackQuery`, `error`, `playbackStats`, `playbackReport`

### `updatePlaylist` (owner only)

Sent by the client to update the room playlist.

- Current media **must** be in the playlist. [^1]
- Duplicates are not allowed. (all token body's source properties must be unique) [^1]

[^1]: Because the playlist is just an array of media tokens. There is no way to figure out which media is currently playing otherwise.

```ts
type PlaylistUpdate = {
    playlist: Media[];
}

```

Replies/related: `roomUpdated`, `error`

### `playbackStats`

Sent by the client to report playback stats.

```ts
type PlaybackStatsPayload = {
    latency: number;
    offset: number;
    buffer: number;
}
```

Replies/related: `playbackReport`

### `struggle`

Sent by the client to indicate playback issues (video buffering for 10+ seconds).

```ts
type StrugglePayload = null;
```

Replies/related: `userStruggle`, `error`

## WS Server->Client messages

### `roomHello`

```ts
type RoomHelloPayload = {
    you: WireUser;
} & WireRoom
```

### `roomUpdated`

```ts
type RoomUpdatedPayload = Partial<WireRoom>
```

### `pong`

Sent by the server in response to a `ping` message.

```ts
type PongPayload = {
    timestamp: number; // server timestamp in milliseconds
}
```

### `ssync`

Sent by the server to all clients when the room sync state is updated.

```ts
type SSyncPayload = SyncPayload;
```

### `chatMessage`

Sent by the server to all clients when a new chat message is posted.

```ts

type UserMessage = {
    type: 'user';
    timestamp: number; 
    userId: string;
    text?: string;
    recommendation?: Media;
}

type SystemMessage = {
    type: 'system';
    timestamp: number;
    text: string;
}

type ChatMessagePayload = UserMessage | SystemMessage;

```

### `chatCleared`

A hint to clear the chat history. You don't **have** to, but you should.

```ts
type ChatClearedPayload = null;
```

### `userJoin`

Sent by the server to all clients when a new user joins the room.

```ts
type UserJoinPayload = WireUser;
```

### `userLeave`

Sent by the server to all clients when a user leaves the room.

```ts
type UserLeavePayload = {
    userId: string;
}
```

### `userState`

Sent by the server to all clients when a user's state changes.

```ts
type UserStatePayload = {
    userId: string;
    state: 'present' | 'disconnected';
}
```

### `playbackQuery`

Sent by the server to a user. Reply is not required, but appreciated.

```ts
type PlaybackQueryPayload = null;
```

### `playbackReport`

Sent by the server to the room owner with a user's playback stats.

```ts
type PlaybackReportPayload = {
    userId: string;
    stats: PlaybackStatsPayload;
}
```

### `userStruggle`

Sent by the server to the room owner when a user indicates playback issues.

```ts
type UserStrugglePayload = {
    userId: string;
}
```

### `error`

Sent by the server to a client when an error occurs processing a message.

```ts

type ErrorType = // non exhaustive, check the code for exact list
    | 'malformedMsg'
    | 'unauthorized'
    | 'ratelimit'
    | 'invalidMedia'
    | 'badSync'
    | 'userNotFound'
    | 'badRoomUpdate'
    | 'playlistCurrentMediaMissing'
    | 'playlistDuplicates'


type ErrorPayload = {
    cause?: string; // message type that caused the error (helping clients out)

    type: ErrorType;

    message: string; // A human-readable error message

    timeoutSeconds?: number; // for 'ratelimit' errors
}
```

## Notes on Time Synchronization and Timestamps

Most timestamps are in milliseconds since UNIX epoch, durations are also in milliseconds.

(notable exception: `iat`, but it's only there for looks :upside_down:)

### `ping`,`pong`, latency and clock offset

Each ping should go something like this:

```python
tick # remember this time

send ping

recv pong # remeber server's time

tock #remember this time

latency = (tock - tick)
clockOffset = serverTime - (tick + latency/2)

# this is basically shitty NTP 
# (only one server timestamp since we don't get low level networking access)
# (( and less considerations about jumps, drift, ... ))
```

The client should fire off a few pings and pick the one with the lowest latency to estimate clock offset.

Sending pings periodically is encouraged. (with or without actually adjusting the clock offset)

### Timestamps?

Most timestamps sent by the server (e.g. in chat messages) are in server time (milliseconds since epoch). Clients should try their best to adjust them to their local clock using the estimated clock offset. (can be annoying since first timestamps arrive before clock offset is known)

### Sync state

When a video is playing, the client needs to compute the current playback position based on synchronized time.

```python
serverTime = localTime + clockOffset
videoTimeMs = serverTime * syncRate + syncOffset
```
