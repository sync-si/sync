<script setup lang="ts">
import { watch } from 'vue';
import SyncButton from '../components/button/sync-button.vue';
import SyncInput from '../components/input/sync-input.vue';
import { useRegle } from '@regle/core';
import { minLength, maxLength, regex, required } from '@regle/rules';
import slugify from 'slugify';

const SLUG_OPTIONS = {
    lower: true,
    strict: true
};

const props = defineProps<{
    name?: string;
}>();

const { r$ } = useRegle({
    name: props.name ?? '',
    slug: props.name ? slugify(props.name, SLUG_OPTIONS) : ''
}, {
    name: {
        required,
        minLength: minLength(1),
        maxLength: maxLength(64)
    },
    slug: {
        required,
        minLength: minLength(1),
        maxLength: maxLength(64),
        regex: regex(/^[a-z0-9-]+$/),
    }
}, {
    autoDirty: true
});

watch(r$.$value, (nw) => {
    r$.$value.slug = slugify(nw.name, SLUG_OPTIONS);
});

function go() {
    if (r$.$invalid) return;

    // create room

    console.log('Creating room:', r$.$value);
}

</script>

<template>
    <main>
        <h1>Create a Room</h1>
        <div id="create-form" @keydown.enter="go">
            <SyncInput class="w350 shadow-low" name="roomName" label="Room Name" v-model="r$.$value.name"
                :err="r$.name.$errors[0]" />
            <SyncInput class="w350 shadow-low" name="slug" label="Slug" v-model="r$.$value.slug"
                :err="r$.slug.$errors[0]" />
            <SyncButton class="shadow-low" bstyle="mat" color="primary" text="Create room" :disabled="r$.$invalid"
                @click="go" />
        </div>
    </main>
</template>

<style scoped>
main {
    height: 100vh;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;

}

#create-form {
    display: flex;
    flex-direction: column;
    align-items: end;
    gap: 1rem;
}

h1 {
    margin: 0;
    font-size: 40px;
    font-weight: var(--s-weight-light);
}

.w350 {
    width: 350px;
}
</style>