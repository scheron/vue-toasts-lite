import {ref} from "vue"

import type {ComponentPublicInstance} from "vue"
import type {ToastPosition} from "./types"

type ToastInstance = ComponentPublicInstance & {
  pause: () => void
  resume: () => void
}

export function useToastRefs() {
  const toastRefs = ref<Map<ToastPosition, ToastInstance[]>>(new Map())

  function setRef(position: ToastPosition, index: number, el: ComponentPublicInstance | Element | null) {
    if (!toastRefs.value.has(position)) {
      toastRefs.value.set(position, [])
    }
    const refs = toastRefs.value.get(position)!
    if (el && "pause" in el && "resume" in el) {
      refs[index] = el as ToastInstance
    }
  }

  function pauseAll(position: ToastPosition) {
    toastRefs.value.get(position)?.forEach((toast) => toast?.pause())
  }

  function resumeAll(position: ToastPosition) {
    toastRefs.value.get(position)?.forEach((toast) => toast?.resume())
  }

  return {
    setRef,
    pauseAll,
    resumeAll,
  }
}
