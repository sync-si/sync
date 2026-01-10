import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Identity {
    name: string
    gravatarHash: string
}

const KEY = 'sync3-identities'
const VERSION = 1

interface LocalStorageIdentities {
    version: number
    identities: Identity[]
}

function isIdentity(obj: unknown): obj is Identity {
    if (typeof obj !== 'object' || obj === null) return false

    if (!('name' in obj) || typeof obj.name !== 'string') return false
    if (!('gravatarHash' in obj) || typeof obj.gravatarHash !== 'string') return false

    return true
}

function isLocalStorageIdentities(object: unknown): object is LocalStorageIdentities {
    if (typeof object !== 'object' || object === null) return false

    if (!('version' in object) || object.version !== VERSION) return false
    if (!('identities' in object) || !Array.isArray(object.identities)) return false

    if (!object.identities.every(isIdentity)) return false

    return true
}

function storeIdentities(identities: Identity[]) {
    const data: LocalStorageIdentities = {
        version: VERSION,
        identities,
    }

    localStorage.setItem(KEY, JSON.stringify(data))
}

function loadIdentities(): Identity[] {
    try {
        const data = JSON.parse(localStorage.getItem(KEY)!)

        return isLocalStorageIdentities(data) ? data.identities : []
    } catch {
        return []
    }
}

export const useIdentityStore = defineStore('identity', () => {
    const recentIdentities = ref<Identity[]>(loadIdentities())

    function addIdentity(identity: Identity) {
        const a = recentIdentities.value
            .filter((i) => !(i.name === identity.name && i.gravatarHash === identity.gravatarHash))
            .slice(0, 2)

        console.log(a)
        recentIdentities.value = [identity, ...a]
        storeIdentities(recentIdentities.value)
    }

    function removeIdentityByValue(identity: Identity) {
        recentIdentities.value = recentIdentities.value.filter(
            (i) => !(i.name === identity.name && i.gravatarHash === identity.gravatarHash),
        )
        storeIdentities(recentIdentities.value)
    }

    window.addEventListener('storage', (se) => {
        if (se.key !== KEY) return
        recentIdentities.value = loadIdentities()
    })

    return {
        recentIdentities,
        addIdentity,
        removeIdentityByValue,
    }
})
