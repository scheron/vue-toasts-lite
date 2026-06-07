<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch} from "vue"

import type {Toast} from "../model/types"

const props = defineProps<Toast & {hideCloseButton: boolean}>()
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
  <div
    :class="['toasts-lite__toast', `toasts-lite__toast--${type}`, {'toasts-lite__toast--clickable': closable}]"
    :style="`--toast-duration: ${duration}s;`"
    @click="closable && close()"
  >
    <div v-if="['success', 'error', 'loading', 'warn', 'info'].includes(type)" class="toasts-lite__icon">
      <div :class="`toasts-lite__${type}`" />
    </div>
    <div class="toasts-lite__content">
      <div class="toasts-lite__content-message">{{ message }}</div>
    </div>
    <button v-if="closable && !hideCloseButton" type="button" class="toasts-lite__close" aria-label="Close" @click.stop="close">
      <span class="toasts-lite__close-icon" aria-hidden="true" />
    </button>
  </div>
</template>
