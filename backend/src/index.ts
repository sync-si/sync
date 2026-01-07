import { Elysia } from 'elysia'
import { startWebSocketServer } from './WebSocketServer.ts'

const statusler = 'healthy'
let uptimeler = Date.now()

const health = new Elysia()
    .get('/health', () => {
        return {
            status: statusler,
            uptime: Math.floor((Date.now() - uptimeler) / 1000),
        }
    })
    .listen(3000)

console.log(`🦊 Elysia is running at ${health.server?.hostname}:${health.server?.port}`)

startWebSocketServer()
