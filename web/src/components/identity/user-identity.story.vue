<script setup lang="ts">
import { gravatarUrl } from '../../util/gravatar'
import UserIdentity from './user-identity.vue'
import Anon from '../../assets/Anon.svg'

const maticGravatar = gravatarUrl(
    'd3e37c0852d096119c94cd79040f675052459eb5a57690d85f2bc7acc1a04c1f',
)
</script>

<template>
    <Story title="Identity/UserIdentity" :layout="{ type: 'grid', width: '400px' }">
        <Variant title="Anonymous">
            <UserIdentity title="Anonymous" username="Anon#124757" :image="Anon" preferred />
        </Variant>

        <Variant title="Recent">
            <UserIdentity
                title="Recent Identity"
                username="Matic?"
                :image="maticGravatar"
                allowDelete
            />
        </Variant>
    </Story>
</template>
