<script setup lang="ts">
import {computed, ref, onBeforeUpdate, type ComponentPublicInstance} from "vue"
import ToastsLiteItem from "./ToastsLiteItem.vue"
import {toastsController} from '../model/ToastsController'
import type {ToastPosition} from "../model/types"

type ToastInstance = ComponentPublicInstance<{}, {}, {}, {}, {}, {}, {}, {}, false, typeof ToastsLiteItem> & {
  pause: () => void
  resume: () => void
}
type ToastRefMap = Record<ToastPosition, ToastInstance[]>

const items = ref(toastsController.toastList)

toastsController.onToastsListChange((toasts) => {
  items.value = toasts
})

const groupedByPosition = computed(() => {
  const groups = new Map<ToastPosition, typeof items.value>()
  
  items.value.forEach(toast => {
    const position = toast.position || "top-center"
    if (!groups.has(position)) {
      groups.set(position, [])
    }
    groups.get(position)!.push(toast)
  })
  
  return groups
})

const positions = computed(() => Array.from(groupedByPosition.value.keys()))

const toastRefsMap = ref<ToastRefMap>({} as ToastRefMap)

onBeforeUpdate(() => {
  for (const pos of positions.value) {
    toastRefsMap.value[pos] = []
  }
})

function onMouseEnter(position: ToastPosition) {
  if (toastRefsMap.value[position]) {
    toastRefsMap.value[position].forEach((toast: ToastInstance) => toast?.pause())
  }
}

function onMouseLeave(position: ToastPosition) {
  if (toastRefsMap.value[position]) {
    toastRefsMap.value[position].forEach((toast: ToastInstance) => toast?.resume())
  }
}

function addToastRef(position: ToastPosition, el: ComponentPublicInstance | Element | null) {
  if (!toastRefsMap.value[position]) {
    toastRefsMap.value[position] = []
  }

  if (el && 'pause' in el && 'resume' in el) {
    toastRefsMap.value[position].push(el as ToastInstance)
  }
}
</script>

<template>
  <Teleport to="body">
    <div 
      v-for="position in positions" 
      :key="position" 
      :class="['toasts-lite__toast-container', `toasts-lite__${position}`]" 
      @mouseenter="onMouseEnter(position)" 
      @mouseleave="onMouseLeave(position)"
    >
      <transition-group name="toasts-lite">
        <ToastsLiteItem
          v-for="item in groupedByPosition.get(position)"
          :id="item.id"
          :ref="(el) => addToastRef(position, el)"
          :key="item.id"
          :type="item.type"
          :message="item.message"
          :auto-close="item.autoClose"
          :duration="item.duration"
          :position="item.position"
          @close="toastsController.remove(item.id)"
        />
      </transition-group>
    </div>
  </Teleport>
</template>

<style src="../styles/index.css" />
