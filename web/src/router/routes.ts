import type { RouteRecordRaw } from 'vue-router'

export const routes = [
    {
        path: '/',
        name: 'home',
        component: () => import('../views/HomeView.vue'),
    },

    {
        path: '/create',
        name: 'create',
        component: () => import('../views/CreateRoomView.vue'),
        props: (r) => ({ name: typeof r.query.name === 'string' ? r.query.name : '' }),
    },

    {
        path: '/r/:roomId',
        name: 'room',
        component: () => import('../views/RoomView.vue'),
        props: true,
    },
] satisfies RouteRecordRaw[]
