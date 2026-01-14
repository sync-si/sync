import { createApp } from 'vue'
import './syncds.css'
import './main.css'
import App from './App.vue'
import { router } from './router'
import { RegleVuePlugin } from '@regle/core'
import { useInteractionStore } from './stores/interaction'
import { createPinia } from 'pinia'

const app = createApp(App).use(router).use(createPinia()).use(RegleVuePlugin)

// Initialize interaction store early to track user interactions before room mount
useInteractionStore()

app.mount('#app')
