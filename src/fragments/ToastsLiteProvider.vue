<script setup lang="ts">
import {computed, ref} from "vue"

import {toastsController} from "../model/ToastsController"
import {useToastRefs} from "../model/useToastRefs"
import ToastsLiteItem from "./ToastsLiteItem.vue"

import type {ToastPosition, Toast} from "../model/types"

const allPositions: ToastPosition[] = ["top-left", "top-center", "top-right", "middle-center", "bottom-left", "bottom-center", "bottom-right"]

const items = ref<Toast[]>([])

const {setRef, pauseAll, resumeAll} = useToastRefs()

toastsController.onToastsListChange((toasts) => {
  items.value = toasts
})

const groupedByPosition = computed(() => {
  const groups = new Map<ToastPosition, typeof items.value>()

  items.value.forEach((toast) => {
    const position = toast.position || "top-center"
    if (!groups.has(position)) groups.set(position, [])
    groups.get(position)!.push(toast)
  })

  return groups
})
</script>

<template>
  <Teleport to="body">
    <div v-for="position in allPositions" :key="position" :class="['toasts-lite__toast-container', `toasts-lite__${position}`]">
      <div class="toasts-lite__toast-wrapper" @mouseenter="pauseAll(position)" @mouseleave="resumeAll(position)">
        <transition-group name="toasts-lite" appear>
          <ToastsLiteItem
            v-for="(item, index) in groupedByPosition.get(position) || []"
            :id="item.id"
            :ref="(el) => setRef(position, index, el)"
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
    </div>
  </Teleport>
</template>

<style src="../styles/index.css" />
