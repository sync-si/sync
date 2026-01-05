<script setup lang="ts">
import SyncInput from './sync-input.vue';

</script>

<template>
    <Story :layout="{ type: 'grid', width: '400px' }">
        <Variant title="Normal">
            <SyncInput name="input" label="Input" placeholder="Enter some text" />
        </Variant>

        <Variant title="With error">
            <SyncInput name="input-error" label="Input with error" placeholder="Enter some text"
                err="This is an error message." />
        </Variant>
    </Story>
</template>
