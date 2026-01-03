import { Elysia } from "elysia";

const app = new Elysia()
    .get("/randomNumber", () => 42)
    .get('/health', () => 'OK')
    .listen(3000);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);