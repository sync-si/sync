import { createApp } from 'vue'
import './syncds.css'
import './main.css'
import App from './App.vue'
import { router } from './router'
import { RegleVuePlugin } from '@regle/core'
import { createPinia } from 'pinia'

createApp(App).use(router).use(createPinia()).use(RegleVuePlugin).mount('#app')
