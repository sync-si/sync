<script setup lang="ts">
import SyncButton from './sync-button.vue'

const styleOptions = ['mat', 'small', 'pill'] as const
const colorOptions = ['primary', 'primary-lt', 'danger', 'danger-lt', 'background'] as const
const disabledOptions = [false, true] as const
</script>

<template>
    <Story :layout="{ type: 'grid', width: '150px' }">
        <template v-for="s in styleOptions" :key="s">
            <template v-for="c in colorOptions" :key="c">
                <template v-for="d in disabledOptions" :key="d.toString()">
                    <Variant :title="`${s},${c},${d}`">
                        <SyncButton text="Button" :bstyle="s" :color="c" :disabled="d" />
                    </Variant>
                </template>
            </template>
        </template>

        <template v-for="s in styleOptions" :key="s">
            <template v-for="c in colorOptions" :key="c">
                <template v-for="d in disabledOptions" :key="d.toString()">
                    <Variant :title="`icon ${s},${c},${d}`">
                        <SyncButton text="Button" :bstyle="s" :color="c" :disabled="d" icon="arrow_forward" />
                    </Variant>
                </template>
            </template>
        </template>

        <template v-for="c in colorOptions" :key="c">
            <template v-for="d in disabledOptions" :key="d.toString()">
                <Variant :title="`icon circle ${c},${d}`">
                    <SyncButton bstyle="circle" :color="c" :disabled="d" icon="arrow_forward" />
                </Variant>
            </template>
        </template>

        <template v-for="d in disabledOptions" :key="d.toString()">
            <Variant :title="`icon gray ${d}`">
                <SyncButton bstyle="none" color="bgnb" :disabled="d" icon="arrow_forward" />
            </Variant>
        </template>

        <template v-for="d in disabledOptions" :key="d.toString()">
            <Variant :title="`icon white ${d}`">
                <div style="background-color: black; padding: 8px;">
                    <SyncButton bstyle="none" color="white" :disabled="d" icon="arrow_forward" />
                </div>
            </Variant>
        </template>
    </Story>
</template>
