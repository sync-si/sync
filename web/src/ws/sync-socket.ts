export enum SyncSocketState {
    /**
     * Socket is not connected.
     */
    Disconnected = 'disconnected',

    /**
     * Socket is trying to connect.
     */
    Connecting = 'connecting',

    /**
     * Socket is connected and operational.
     */
    Connected = 'connected',

    /**
     * Socket was disconnected but is trying to reconnect.
     */
    Reconnecting = 'reconnecting',

    /**
     * Socket was closed cleanly.
     */
    Closed = 'closed',

    /**
     * Socket did not recover from a disconnect, or never connected successfully.
     */
    Failed = 'failed',
}

export class SyncSocket {
    private state: SyncSocketState = SyncSocketState.Disconnected
    private socket: WebSocket | undefined
    private retries = 0

    private closeCode: number | undefined
    private closeReason: string | undefined
    private closedByUs = false

    private retryTimeoutRef: number | undefined

    public onConnected: (() => void) | undefined
    public onReconnectAttempt: ((n: number) => void) | undefined
    public onCleanClose: ((code: number, reason: string) => void) | undefined
    public onFailed: (() => void) | undefined
    public onMessage: ((msg: unknown) => void) | undefined

    public constructor(private url: string) {}

    public connect() {
        if (this.state !== SyncSocketState.Disconnected) {
            throw new Error('Socket is already connected or connecting')
        }

        this.setState(SyncSocketState.Connecting)
        this._createSocket()
    }

    public sendMessage(msg: unknown): boolean {
        if (this.state !== SyncSocketState.Connected || !this.socket) {
            return false
        }

        this.socket.send(JSON.stringify(msg))
        return true
    }

    /**
     * Closes the socket without firing any callbacks
     */
    public close(code: number, reason: string): boolean {
        if (this.socket && this.state === SyncSocketState.Connected) {
            this.closedByUs = true
            this.setState(SyncSocketState.Closed)
            this.socket.close(code, reason)
            return true
        }
        return false
    }

    /**
     * Stop everything, fire nothing
     */
    public giveUp() {
        this.onConnected = undefined
        this.onReconnectAttempt = undefined
        this.onCleanClose = undefined
        this.onFailed = undefined
        this.onMessage = undefined

        if (this.retryTimeoutRef) {
            window.clearTimeout(this.retryTimeoutRef)
            this.retryTimeoutRef = undefined
        }

        this.closedByUs = true

        if (this.socket) {
            this._clearSocket()
        }

        this.setState(SyncSocketState.Failed)
    }

    //#region Internal lifecycle methods

    private setState(state: SyncSocketState) {
        console.log(`[SyncSocket] State change: ${this.state} -> ${state}`)
        this.state = state
    }

    private _createSocket() {
        this.socket = new WebSocket(this.url, ['sync3'])
        this.socket.onopen = this._wsOpen.bind(this)
        this.socket.onclose = this._wsClose.bind(this)
        this.socket.onmessage = this._wsMessage.bind(this)
        this.socket.onerror = this._wsError.bind(this)
    }

    private _clearSocket() {
        if (this.socket) {
            this.socket?.close()
            this.socket.onopen = null
            this.socket.onclose = null
            this.socket.onmessage = null
            this.socket.onerror = null
        }
        this.socket = undefined
    }

    private _message(msg: unknown) {
        this.onMessage?.(msg)
    }

    /**
     * Called internally when the socket is lost.
     */
    private _lost() {
        this._clearSocket()

        this.setState(SyncSocketState.Reconnecting)
        this.retries++

        if (this.retries === 1) {
            console.log('[SyncSocket] Attempting immediate reconnect (1st retry)')
            this._createSocket()
            this.onReconnectAttempt?.(this.retries)
        } else if (this.retries < 5) {
            const timeout = (1 << (this.retries - 1)) * 1000

            console.log(
                `[SyncSocket] Scheduling reconnect in ${timeout}ms (retry #${this.retries})`,
            )

            this.retryTimeoutRef = window.setTimeout(() => {
                this.onReconnectAttempt?.(this.retries)
                this._createSocket()
            }, timeout) // NodeJS vs browser timeout ID difference
        } else {
            this._die(false)
        }
    }

    private _die(clean: boolean) {
        this._clearSocket()
        this.setState(clean ? SyncSocketState.Closed : SyncSocketState.Failed)
        console.log(
            `[SyncSocket] Socket ${
                clean ? 'closed cleanly' : 'failed to reconnect after multiple attempts'
            }`,
        )

        if (clean) {
            this.onCleanClose?.(this.closeCode!, this.closeReason!)
        } else {
            this.onFailed?.()
        }
    }

    private _connected() {
        this.setState(SyncSocketState.Connected)
        this.retries = 0
        this.closeCode = undefined
        this.closeReason = undefined
        this.onConnected?.()
    }

    //#endregion Internal lifecycle methods

    //#region WebSocket event handlers

    private _wsOpen(_e: Event) {
        console.log('[SyncSocket] WebSocket connected')
        this._connected()
    }

    private _wsMessage(e: MessageEvent) {
        if (typeof e.data !== 'string') {
            console.warn('[SyncSocket] Received non-string message, ignoring')
            return
        }

        try {
            const msg = JSON.parse(e.data)
            this._message(msg)
        } catch {
            console.error('[SyncSocket] Failed to parse incoming message')
            return
        }
    }

    private _wsClose(e: CloseEvent) {
        if (this.closedByUs) return

        const { code, reason } = e
        this.closeCode = code
        this.closeReason = reason

        console.log(`[SyncSocket] WebSocket closed: ${code} (${reason})`)

        if (code < 4000 || code > 4999) {
            // Closed outside of app-specific codes, go again
            this._lost()
        } else {
            // Closed cleanly, give up
            this._die(true)
        }
    }

    private _wsError(_e: Event) {
        console.error('[SyncSocket] WebSocket error!')
        // close event will follow !?
    }

    //#endregion WebSocket event handlers
}
