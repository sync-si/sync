import './syncds.css'
import './main.css'

import { defineSetupVue3 } from '@histoire/plugin-vue'

export const setupVue3 = defineSetupVue3(({ app }) => {
    app.provide('key', 'meow')
})
