import {onBeforeUnmount, onMounted, ref, shallowRef} from "vue"

import type {Ref} from "vue"

export type Transform = {x: number; y: number; scale: number}

export type Rect = {x: number; y: number; width: number; height: number}

export type UseCanvasOptions = {
  minScale?: number
  maxScale?: number
  storageKey?: string
}

export type UseCanvasReturn = {
  viewportRef: Ref<HTMLElement | null>
  worldRef: Ref<HTMLElement | null>
  zoom: Ref<number>
  transform: Ref<Transform>
  focusOn: (rect: Rect, padding?: number, animate?: boolean) => void
  resetView: () => void
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Pan/zoom viewport — port of GrammarDiff's DesignCanvas.
 * Distinguishes trackpad pinch vs notched wheel vs two-finger scroll;
 * supports Safari `gesture*` events; drag-pan on background only;
 * exposes `--tl-inv-zoom` for chrome counter-scaling.
 */
export function useCanvas(opts: UseCanvasOptions = {}): UseCanvasReturn {
  const minScale = opts.minScale ?? 0.15
  const maxScale = opts.maxScale ?? 3
  const storageKey = opts.storageKey ?? "tl-viewport"

  const viewportRef = ref<HTMLElement | null>(null)
  const worldRef = ref<HTMLElement | null>(null)
  const zoom = ref(1)
  const transform = shallowRef<Transform>({x: 0, y: 0, scale: 1})

  const tf = {x: 0, y: 0, scale: 1}
  let saveTimer: number | null = null
  let rafId: number | null = null

  const apply = () => {
    const el = worldRef.value
    if (!el) return
    el.style.transform = `translate3d(${tf.x}px, ${tf.y}px, 0) scale(${tf.scale})`
    el.style.setProperty("--tl-inv-zoom", String(1 / tf.scale))
    zoom.value = tf.scale
    transform.value = {x: tf.x, y: tf.y, scale: tf.scale}
    if (saveTimer != null) clearTimeout(saveTimer)
    saveTimer = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(tf))
      } catch {
        /* ignore */
      }
    }, 200)
  }

  const clampScale = (s: number) => Math.min(maxScale, Math.max(minScale, s))

  const zoomAt = (cx: number, cy: number, factor: number) => {
    const vp = viewportRef.value
    if (!vp) return
    const r = vp.getBoundingClientRect()
    const px = cx - r.left
    const py = cy - r.top
    const next = clampScale(tf.scale * factor)
    const k = next / tf.scale
    tf.x = px - (px - tf.x) * k
    tf.y = py - (py - tf.y) * k
    tf.scale = next
    apply()
  }

  /**
   * Smoothly pan+zoom so the given world-rect is centered and padded
   * inside the viewport. `padding` is in screen pixels (each side).
   */
  const focusOn = (rect: Rect, padding = 80, animate = true) => {
    const vp = viewportRef.value
    if (!vp) return
    const r = vp.getBoundingClientRect()
    const sx = (r.width - padding * 2) / rect.width
    const sy = (r.height - padding * 2) / rect.height
    const targetScale = clampScale(Math.min(sx, sy))
    const targetX = r.width / 2 - (rect.x + rect.width / 2) * targetScale
    const targetY = r.height / 2 - (rect.y + rect.height / 2) * targetScale

    if (!animate) {
      tf.x = targetX
      tf.y = targetY
      tf.scale = targetScale
      apply()
      return
    }

    const startX = tf.x
    const startY = tf.y
    const startScale = tf.scale
    const duration = 420
    const t0 = performance.now()

    if (rafId != null) cancelAnimationFrame(rafId)

    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      const e = easeOutCubic(t)
      tf.x = startX + (targetX - startX) * e
      tf.y = startY + (targetY - startY) * e
      tf.scale = startScale + (targetScale - startScale) * e
      apply()
      if (t < 1) rafId = requestAnimationFrame(step)
      else rafId = null
    }
    rafId = requestAnimationFrame(step)
  }

  const resetView = () => {
    tf.x = 0
    tf.y = 0
    tf.scale = 1
    apply()
  }

  let isGesturing = false
  let gsBase = 1
  let drag: {id: number; lx: number; ly: number} | null = null

  const isMouseWheel = (e: WheelEvent) => e.deltaMode !== 0 || (e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40)

  const onWheel = (e: WheelEvent) => {
    e.preventDefault()
    if (isGesturing) return
    if ((e.ctrlKey || e.metaKey) && !isMouseWheel(e)) {
      zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01))
    } else if (isMouseWheel(e)) {
      zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18))
    } else {
      tf.x -= e.deltaX
      tf.y -= e.deltaY
      apply()
    }
  }

  const onGestureStart = (e: Event) => {
    e.preventDefault()
    isGesturing = true
    gsBase = tf.scale
  }

  const onGestureChange = (e: Event) => {
    e.preventDefault()
    const ge = e as Event & {scale: number; clientX: number; clientY: number}
    zoomAt(ge.clientX, ge.clientY, (gsBase * ge.scale) / tf.scale)
  }

  const onGestureEnd = (e: Event) => {
    e.preventDefault()
    isGesturing = false
  }

  const onPointerDown = (e: PointerEvent) => {
    const target = e.target as HTMLElement
    const onBg = !target.closest("[data-tl-node]")
    if (!(e.button === 1 || (e.button === 0 && onBg))) return
    e.preventDefault()
    const vp = viewportRef.value
    if (!vp) return
    vp.setPointerCapture(e.pointerId)
    drag = {id: e.pointerId, lx: e.clientX, ly: e.clientY}
    vp.style.cursor = "grabbing"
  }

  const onPointerMove = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return
    tf.x += e.clientX - drag.lx
    tf.y += e.clientY - drag.ly
    drag.lx = e.clientX
    drag.ly = e.clientY
    apply()
  }

  const onPointerUp = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return
    const vp = viewportRef.value
    if (vp) {
      vp.releasePointerCapture(e.pointerId)
      vp.style.cursor = ""
    }
    drag = null
  }

  onMounted(() => {
    const vp = viewportRef.value
    if (!vp) return

    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const s = JSON.parse(raw) as Transform
        if (Number.isFinite(s.x) && Number.isFinite(s.y) && Number.isFinite(s.scale)) {
          tf.x = s.x
          tf.y = s.y
          tf.scale = clampScale(s.scale)
          apply()
        }
      }
    } catch {
      /* ignore */
    }

    vp.addEventListener("wheel", onWheel, {passive: false})
    vp.addEventListener("gesturestart", onGestureStart as EventListener, {passive: false})
    vp.addEventListener("gesturechange", onGestureChange as EventListener, {passive: false})
    vp.addEventListener("gestureend", onGestureEnd as EventListener, {passive: false})
    vp.addEventListener("pointerdown", onPointerDown)
    vp.addEventListener("pointermove", onPointerMove)
    vp.addEventListener("pointerup", onPointerUp)
    vp.addEventListener("pointercancel", onPointerUp)
    apply()
  })

  onBeforeUnmount(() => {
    const vp = viewportRef.value
    if (!vp) return
    vp.removeEventListener("wheel", onWheel)
    vp.removeEventListener("gesturestart", onGestureStart as EventListener)
    vp.removeEventListener("gesturechange", onGestureChange as EventListener)
    vp.removeEventListener("gestureend", onGestureEnd as EventListener)
    vp.removeEventListener("pointerdown", onPointerDown)
    vp.removeEventListener("pointermove", onPointerMove)
    vp.removeEventListener("pointerup", onPointerUp)
    vp.removeEventListener("pointercancel", onPointerUp)
    if (rafId != null) cancelAnimationFrame(rafId)
    if (saveTimer != null) clearTimeout(saveTimer)
  })

  return {viewportRef, worldRef, zoom, transform, focusOn, resetView}
}
