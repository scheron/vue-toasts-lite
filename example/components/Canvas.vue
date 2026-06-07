<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue"

import {CHILDREN_OF, NODES, pathToRoot} from "../data/graph"
import {useCanvas} from "../composables/useCanvas"
import {useTreeLayout} from "../composables/useTreeLayout"
import Edges from "./Edges.vue"
import NodeCard from "./Node.vue"

import type {Rect} from "../composables/useCanvas"

import type {DemoKind} from "../data/graph"

const emit = defineEmits<{
  (e: "select", id: string | null): void
  (e: "demo", demo: DemoKind): void
  (e: "zoom-change", pct: number): void
  (e: "step-change", payload: {index: number; total: number; id: string | null}): void
  (e: "copy", payload: {text: string; ok: boolean}): void
}>()

const {positions, bounds, directionOf} = useTreeLayout()
const {viewportRef, worldRef, zoom, focusOn, resetView} = useCanvas({minScale: 0.12, maxScale: 2.5})

const activeId = ref<string | null>(null)
const hoverId = ref<string | null>(null)
const onPath = computed(() => (activeId.value ? new Set(pathToRoot(activeId.value)) : new Set<string>()))

// Stable DFS order for step-through navigation
const stepOrder = computed<string[]>(() => {
  const out: string[] = []
  const root = NODES.find((n) => n.parent === null)
  if (!root) return out
  const walk = (id: string) => {
    out.push(id)
    for (const cid of CHILDREN_OF[id] || []) walk(cid)
  }
  walk(root.id)
  return out
})
const stepIndex = (id: string) => stepOrder.value.indexOf(id)

const focusNode = (id: string, animate = true) => {
  const layout = positions.value[id]
  if (!layout) return
  const rect: Rect = {
    x: layout.x - 80,
    y: layout.y - 80,
    width: layout.width + 160,
    height: layout.height + 160,
  }
  focusOn(rect, 120, animate)
}

const focusInitial = () => {
  const root = NODES.find((n) => n.parent === null)
  if (!root) return
  const layout = positions.value[root.id]
  if (!layout) return
  // Wider padding around root so the first level of branches peeks into view
  // but we don't try to fit the whole spreading galaxy at once.
  const pad = 360
  focusOn(
    {x: layout.x - pad, y: layout.y - pad, width: layout.width + pad * 2, height: layout.height + pad * 2},
    80,
    false,
  )
  activeId.value = root.id
  emitStep()
}

const fitAll = () => {
  const b = bounds.value
  if (b.width === 0) return
  focusOn({x: 0, y: 0, width: b.width, height: b.height}, 120, true)
}

const emitStep = () => {
  emit("step-change", {
    index: activeId.value ? stepIndex(activeId.value) : -1,
    total: stepOrder.value.length,
    id: activeId.value,
  })
}

// Click selects (no zoom) — purely visual: highlights the branch + active card.
const handleSelect = (id: string) => {
  activeId.value = id
  emit("select", id)
  emitStep()
}

const handleDemo = (demo: DemoKind) => emit("demo", demo)
const handleHover = (id: string | null) => {
  hoverId.value = id
}

const handleBgClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest("[data-tl-node]")) {
    activeId.value = null
    emit("select", null)
    emitStep()
  }
}

// Step navigation: arrows or buttons → moves active forward/back along DFS,
// and pans the camera to the new active card.
const goTo = (id: string) => {
  activeId.value = id
  emit("select", id)
  emitStep()
  focusNode(id, true)
}

const stepNext = () => {
  const order = stepOrder.value
  const cur = activeId.value
  if (!cur) {
    goTo(order[0])
    return
  }
  const i = order.indexOf(cur)
  if (i < 0 || i === order.length - 1) return
  goTo(order[i + 1])
}

const stepPrev = () => {
  const order = stepOrder.value
  const cur = activeId.value
  if (!cur) {
    goTo(order[0])
    return
  }
  const i = order.indexOf(cur)
  if (i <= 0) return
  goTo(order[i - 1])
}

const onKey = (e: KeyboardEvent) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  if (e.key === "ArrowRight" || (e.key === "Tab" && !e.shiftKey)) {
    e.preventDefault()
    stepNext()
  } else if (e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey)) {
    e.preventDefault()
    stepPrev()
  } else if (e.key === "0") {
    e.preventDefault()
    fitAll()
  } else if (e.key === "Escape") {
    activeId.value = null
    emit("select", null)
    emitStep()
  }
}

defineExpose({fitAll, resetView, focusNode, zoom, stepNext, stepPrev, goTo})

onMounted(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => focusInitial())
  })
  document.addEventListener("keydown", onKey)
})

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKey)
})

watch(zoom, (z) => emit("zoom-change", Math.round(z * 100)))
</script>

<template>
  <div ref="viewportRef" class="viewport" @click="handleBgClick">
    <div ref="worldRef" class="world" :style="{width: `${bounds.width}px`, height: `${bounds.height}px`}">
      <div class="grid" aria-hidden="true" />
      <Edges :positions="positions" :bounds="bounds" :directions="directionOf" :active-id="activeId" :hover-id="hoverId" />
      <NodeCard
        v-for="node in NODES"
        :key="node.id"
        :node="node"
        :layout="positions[node.id]"
        :active="activeId === node.id"
        :on-path="onPath.has(node.id)"
        :step-index="stepIndex(node.id)"
        @select="handleSelect"
        @demo="handleDemo"
        @hover="handleHover"
        @copy="(p) => emit('copy', p)"
      />
    </div>
  </div>
</template>

<style scoped>
.viewport {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: var(--paper, #faf8f4);
  overflow: hidden;
  overscroll-behavior: none;
  touch-action: none;
  cursor: grab;
}

.viewport:active {
  cursor: grabbing;
}

.world {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  will-change: transform;
}

.grid {
  position: absolute;
  inset: -8000px;
  pointer-events: none;
  background-image: radial-gradient(circle, var(--grid-dot, rgba(10, 10, 10, 0.1)) 1px, transparent 1.2px);
  background-size: 32px 32px;
  z-index: 0;
  mask-image: radial-gradient(ellipse at center, black 35%, transparent 95%);
}
</style>
