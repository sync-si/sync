import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useInteractionStore = defineStore('interaction', () => {
    const hasInteracted = ref(false)

    function markInteraction() {
        if (!hasInteracted.value) {
            console.log('[InteractionStore] User interaction detected, autoplay now allowed')
            hasInteracted.value = true
        }
    }

    // Set up global listeners once
    let listenersAttached = false

    function attachListeners() {
        if (listenersAttached || typeof document === 'undefined') return

        document.addEventListener('click', markInteraction, { passive: true })
        document.addEventListener('keydown', markInteraction, { passive: true })
        document.addEventListener('touchstart', markInteraction, { passive: true })

        listenersAttached = true
    }

    // Attach listeners immediately when store is created
    attachListeners()

    return {
        hasInteracted,
        markInteraction,
        attachListeners,
    }
})
