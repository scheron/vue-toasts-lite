<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch} from "vue"

import type {ToastProps} from "../model/types"

const props = defineProps<ToastProps>()
const emit = defineEmits(["close"])

const timer = ref<ReturnType<typeof setTimeout> | null>(null)
const startedAt = ref<number>(0)
const remainingTime = ref<number>(0)

function close() {
  if (timer.value) clearTimeout(timer.value)
  emit("close")
}

function pause() {
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
    remainingTime.value = props.duration - (Date.now() - startedAt.value)
  }
}

function resume() {
  if (!timer.value && remainingTime.value > 0) {
    startedAt.value = Date.now()
    timer.value = setTimeout(close, remainingTime.value)
  }
}

function startTimer() {
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }

  if (props.autoClose) {
    startedAt.value = Date.now()
    remainingTime.value = props.duration
    timer.value = setTimeout(close, props.duration)
  }
}

watch(
  () => [props.autoClose, props.duration],
  () => {
    startTimer()
  },
)

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  if (timer.value) {
    clearTimeout(timer.value)
  }
})

defineExpose({
  pause,
  resume,
})
</script>
<template>
  <div class="toasts-lite__toast" :style="`--toast-duration: ${duration}s;`" @click.prevent="close">
    <div v-if="['success', 'error', 'loading', 'warn'].includes(type)" class="toasts-lite__icon">
      <div :class="`toasts-lite__${type}`" />
    </div>
    <div class="toasts-lite__content">
      <div class="toasts-lite__content-message">{{ message }}</div>
    </div>
  </div>
</template>
